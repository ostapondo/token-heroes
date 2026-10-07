import { Agent, type BurnHistory, type BurnTally, type TokenKinds } from '@platform';
import { DATE_LOCALE, FORTNIGHT_DAYS, SECONDS_PER_HOUR, TOP_NAMES } from '../constants';
import { BurnRange, type AgentLine, type Bar, type BurnView, type Share } from '../types';

interface Hour {
  readonly hour: number;
  readonly at: Date;
  readonly tally: BurnTally;
}

const NO_KINDS: TokenKinds = { input: 0, output: 0, cacheWrites: 0, cacheReads: 0 };
const HOUR_TICK_EVERY = 6;
const DAY_TICK_EVERY = 4;

// Every few bars are labelled and so is the last, unless a label would crowd it.
const ticked = (index: number, last: number, every: number): boolean =>
  index === last || (index % every === 0 && last - index >= every / 2);

const kindsTotal = (kinds: TokenKinds | undefined): number =>
  kinds ? kinds.input + kinds.output + kinds.cacheWrites + kinds.cacheReads : 0;

const plusKinds = (left: TokenKinds, right: TokenKinds | undefined): TokenKinds => ({
  input: left.input + (right?.input ?? 0),
  output: left.output + (right?.output ?? 0),
  cacheWrites: left.cacheWrites + (right?.cacheWrites ?? 0),
  cacheReads: left.cacheReads + (right?.cacheReads ?? 0),
});

const dayOf = (date: Date): string => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const AGENTS: readonly string[] = Object.values(Agent);
const isAgent = (value: string): value is Agent => AGENTS.includes(value);

function entries(agents: BurnTally['agents']): [Agent, TokenKinds][] {
  return Object.entries(agents).flatMap(([agent, kinds]): [Agent, TokenKinds][] =>
    isAgent(agent) ? [[agent, kinds]] : [],
  );
}

function hoursOf(history: BurnHistory): Hour[] {
  return Object.entries(history.hours).map(([key, tally]) => ({
    hour: Number(key),
    at: new Date(Number(key) * SECONDS_PER_HOUR * 1000),
    tally,
  }));
}

function merged(tallies: readonly BurnTally[]): BurnTally {
  const agents: Partial<Record<Agent, TokenKinds>> = {};
  const projects: Record<string, number> = {};
  const models: Record<string, number> = {};

  for (const tally of tallies) {
    for (const [agent, kinds] of entries(tally.agents)) {
      agents[agent] = plusKinds(agents[agent] ?? NO_KINDS, kinds);
    }
    for (const [name, tokens] of Object.entries(tally.projects)) {
      projects[name] = (projects[name] ?? 0) + tokens;
    }
    for (const [name, tokens] of Object.entries(tally.models)) {
      models[name] = (models[name] ?? 0) + tokens;
    }
  }

  return { agents, projects, models };
}

const top = (named: Readonly<Record<string, number>>): Share[] =>
  Object.entries(named)
    .map(([name, tokens]) => ({ name, tokens }))
    .filter((share) => share.tokens > 0)
    .toSorted((left, right) => right.tokens - left.tokens)
    .slice(0, TOP_NAMES);

function agentLines(tally: BurnTally, hours: readonly Hour[]): AgentLine[] {
  return entries(tally.agents)
    .map(([agent, kinds]) => {
      const burned = hours.filter((hour) => kindsTotal(hour.tally.agents[agent]) > 0);

      return {
        agent,
        tokens: kindsTotal(kinds),
        lastHour: burned.length > 0 ? Math.max(...burned.map((hour) => hour.hour)) : null,
      };
    })
    .filter((line) => line.tokens > 0)
    .toSorted((left, right) => right.tokens - left.tokens);
}

function barOf(label: string, tick: string | null, hours: readonly Hour[]): Bar {
  const agents: Partial<Record<Agent, number>> = {};

  for (const hour of hours) {
    for (const [agent, kinds] of entries(hour.tally.agents)) {
      agents[agent] = (agents[agent] ?? 0) + kindsTotal(kinds);
    }
  }

  return {
    label,
    tick,
    agents,
    tokens: Object.values(agents).reduce((sum, value) => sum + value, 0),
  };
}

function todayBars(hours: readonly Hour[], now: Date): Bar[] {
  return Array.from({ length: now.getHours() + 1 }, (_, clock) => {
    const label = `${String(clock).padStart(2, '0')}:00`;
    const tick = ticked(clock, now.getHours(), HOUR_TICK_EVERY) ? String(clock) : null;

    return barOf(
      label,
      tick,
      hours.filter((hour) => hour.at.getHours() === clock),
    );
  });
}

function fortnightDays(now: Date): Date[] {
  return Array.from({ length: FORTNIGHT_DAYS }, (_, index) => {
    const day = new Date(now);

    day.setDate(now.getDate() - (FORTNIGHT_DAYS - 1 - index));

    return day;
  });
}

function fortnightBars(hours: readonly Hour[], days: readonly Date[]): Bar[] {
  return days.map((day, index) => {
    const label = day.toLocaleDateString(DATE_LOCALE, { day: 'numeric', month: 'short' });
    const tick = ticked(index, days.length - 1, DAY_TICK_EVERY) ? String(day.getDate()) : null;

    return barOf(
      label,
      tick,
      hours.filter((hour) => dayOf(hour.at) === dayOf(day)),
    );
  });
}

// What the menu shows for a range. Hours are UTC, so they are grouped here into the player's
// own days. Coins burned before the host told agents apart are counted only in all time.
export function burnView(
  history: BurnHistory,
  range: BurnRange,
  burnedInAll: number,
  now: Date,
): BurnView {
  const all = hoursOf(history);
  const days = fortnightDays(now);
  const inRange =
    range === BurnRange.Today
      ? all.filter((hour) => dayOf(hour.at) === dayOf(now))
      : range === BurnRange.Fortnight
        ? all.filter((hour) => days.some((day) => dayOf(day) === dayOf(hour.at)))
        : all;
  const tally = range === BurnRange.All ? history.total : merged(inRange.map((hour) => hour.tally));
  const kinds = entries(tally.agents).reduce((sum, [, agent]) => plusKinds(sum, agent), NO_KINDS);
  const tracked = kindsTotal(kinds);
  const untracked = range === BurnRange.All ? Math.max(0, burnedInAll - tracked) : 0;

  return {
    tokens: tracked + untracked,
    agents: agentLines(tally, inRange),
    bars:
      range === BurnRange.Today
        ? todayBars(inRange, now)
        : range === BurnRange.Fortnight
          ? fortnightBars(inRange, days)
          : [],
    kinds,
    projects: top(tally.projects),
    models: top(tally.models),
    untracked,
  };
}

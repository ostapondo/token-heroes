import {
  Agent,
  type BurnHistory,
  type BurnTally,
  type TokenKinds,
  type WatchedAgent,
} from './host';

const SECONDS_PER_HOUR = 3600;
const HOURS = 14 * 24;
// The browser build shows a made-up fortnight: Codex for a few days, then Claude Code, with
// most tokens re-read from the cache as real agents do.
const SPLIT = { input: 0.001, output: 0.004, cacheWrites: 0.015, cacheReads: 0.98 } as const;
const CODEX_UNTIL_HOUR = 4 * 24;
const PROJECTS = ['token-heroes', 'granttry', 'admin-portal'] as const;
const MODELS = { [Agent.ClaudeCode]: 'claude-opus-5-5', [Agent.Codex]: 'gpt-6-sol' } as const;

const EMPTY: BurnTally = { agents: {}, projects: {}, models: {} };

function kindsOf(tokens: number): TokenKinds {
  return {
    input: Math.round(tokens * SPLIT.input),
    output: Math.round(tokens * SPLIT.output),
    cacheWrites: Math.round(tokens * SPLIT.cacheWrites),
    cacheReads: Math.round(tokens * SPLIT.cacheReads),
  };
}

const sumKinds = (left: TokenKinds | undefined, right: TokenKinds): TokenKinds => ({
  input: (left?.input ?? 0) + right.input,
  output: (left?.output ?? 0) + right.output,
  cacheWrites: (left?.cacheWrites ?? 0) + right.cacheWrites,
  cacheReads: (left?.cacheReads ?? 0) + right.cacheReads,
});

const total = (kinds: TokenKinds) =>
  kinds.input + kinds.output + kinds.cacheWrites + kinds.cacheReads;

function plus(tally: BurnTally, agent: Agent, project: string, tokens: number): BurnTally {
  const kinds = kindsOf(tokens);
  const burned = total(kinds);
  const model = MODELS[agent === Agent.Codex ? Agent.Codex : Agent.ClaudeCode];

  return {
    agents: { ...tally.agents, [agent]: sumKinds(tally.agents[agent], kinds) },
    projects: { ...tally.projects, [project]: (tally.projects[project] ?? 0) + burned },
    models: { ...tally.models, [model]: (tally.models[model] ?? 0) + burned },
  };
}

export function recordBurn(history: BurnHistory, tokens: number, now: number): BurnHistory {
  const hour = String(Math.floor(now / 1000 / SECONDS_PER_HOUR));

  return {
    since: history.since ?? Math.floor(now / 1000),
    hours: {
      ...history.hours,
      [hour]: plus(history.hours[hour] ?? EMPTY, Agent.ClaudeCode, PROJECTS[0], tokens),
    },
    total: plus(history.total, Agent.ClaudeCode, PROJECTS[0], tokens),
  };
}

export function sampleHistory(now: number): BurnHistory {
  const latest = Math.floor(now / 1000 / SECONDS_PER_HOUR);
  let history: BurnHistory = {
    since: (latest - HOURS) * SECONDS_PER_HOUR,
    hours: {},
    total: EMPTY,
  };

  for (let back = HOURS; back >= 0; back -= 1) {
    const hour = latest - back;
    const awake = ((hour % 24) + 24) % 24 >= 8;
    const tokens = awake ? 20_000_000 + ((hour * 7919) % 11) * 9_000_000 : 0;

    if (tokens === 0) continue;
    const agent = back > HOURS - CODEX_UNTIL_HOUR ? Agent.Codex : Agent.ClaudeCode;
    const project = PROJECTS[hour % PROJECTS.length] ?? PROJECTS[0];
    const key = String(hour);

    history = {
      ...history,
      hours: { ...history.hours, [key]: plus(history.hours[key] ?? EMPTY, agent, project, tokens) },
      total: plus(history.total, agent, project, tokens),
    };
  }

  return history;
}

export const SAMPLE_AGENTS: readonly WatchedAgent[] = [
  { agent: Agent.ClaudeCode, path: '~/.claude/projects', found: true, transcripts: 420 },
  { agent: Agent.Codex, path: '~/.codex/sessions', found: true, transcripts: 383 },
  { agent: Agent.GeminiCli, path: '~/.gemini/tmp', found: false, transcripts: null },
  { agent: Agent.QwenCode, path: '~/.qwen/projects', found: false, transcripts: null },
  {
    agent: Agent.OpenCode,
    path: '~/.local/share/opencode/opencode.db',
    found: true,
    transcripts: null,
  },
  { agent: Agent.KiloCode, path: '~/.local/share/kilo/kilo.db', found: false, transcripts: null },
];

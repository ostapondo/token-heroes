import { Agent, type BurnHistory, type BurnTally } from '@platform';
import { describe, expect, it } from 'vitest';
import { BurnRange } from '../types';
import { burnView } from './burn-view';

const NOW = new Date(2026, 9, 7, 16, 30);
const hourOf = (date: Date) => String(Math.floor(date.getTime() / 3_600_000));
const burned = (agent: Agent, cacheReads: number, project = 'heroes'): BurnTally => ({
  agents: { [agent]: { input: 0, output: 0, cacheWrites: 0, cacheReads } },
  projects: { [project]: cacheReads },
  models: { opus: cacheReads },
});

const HISTORY: BurnHistory = {
  since: 0,
  hours: {
    [hourOf(new Date(2026, 9, 7, 9))]: burned(Agent.ClaudeCode, 300),
    [hourOf(new Date(2026, 9, 7, 15))]: burned(Agent.ClaudeCode, 100, 'portal'),
    [hourOf(new Date(2026, 9, 6, 22))]: burned(Agent.Codex, 500),
    [hourOf(new Date(2026, 8, 20, 12))]: burned(Agent.Codex, 9_000),
  },
  total: {
    agents: {
      [Agent.ClaudeCode]: { input: 10, output: 20, cacheWrites: 30, cacheReads: 400 },
      [Agent.Codex]: { input: 0, output: 0, cacheWrites: 0, cacheReads: 9_500 },
    },
    projects: { heroes: 9_860, portal: 100 },
    models: { opus: 9_960 },
  },
};

describe('burnView', () => {
  it('shows today by the player’s own hours, up to the current one', () => {
    const view = burnView(HISTORY, BurnRange.Today, 0, NOW);

    expect(view.tokens).toBe(400);
    expect(view.bars).toHaveLength(17);
    expect(view.bars[9]?.agents).toEqual({ [Agent.ClaudeCode]: 300 });
    expect(view.agents).toEqual([
      { agent: Agent.ClaudeCode, tokens: 400, lastHour: Number(hourOf(new Date(2026, 9, 7, 15))) },
    ]);
    expect(view.projects).toEqual([
      { name: 'heroes', tokens: 300 },
      { name: 'portal', tokens: 100 },
    ]);
  });

  it('shows fourteen days and leaves out what came before them', () => {
    const view = burnView(HISTORY, BurnRange.Fortnight, 0, NOW);

    expect(view.bars).toHaveLength(14);
    expect(view.bars.at(-2)?.agents).toEqual({ [Agent.Codex]: 500 });
    expect(view.agents.map((line) => [line.agent, line.tokens])).toEqual([
      [Agent.Codex, 500],
      [Agent.ClaudeCode, 400],
    ]);
  });

  it('counts coins burned before agents were told apart in all time only', () => {
    const view = burnView(HISTORY, BurnRange.All, 20_000, NOW);

    expect(view.untracked).toBe(20_000 - 9_960);
    expect(view.tokens).toBe(20_000);
    expect(view.bars).toEqual([]);
    expect(view.kinds).toEqual({ input: 10, output: 20, cacheWrites: 30, cacheReads: 9_900 });
  });
});

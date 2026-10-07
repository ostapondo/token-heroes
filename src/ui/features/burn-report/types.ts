import type { Agent, TokenKinds } from '@platform';

export const BurnRange = { Today: 'today', Fortnight: 'fortnight', All: 'all' } as const;
export type BurnRange = (typeof BurnRange)[keyof typeof BurnRange];

export interface AgentLine {
  readonly agent: Agent;
  readonly tokens: number;
  // The latest UTC hour, in unix hours, in which the agent burned anything in the range.
  readonly lastHour: number | null;
}

export interface Share {
  readonly name: string;
  readonly tokens: number;
}

export interface Bar {
  readonly label: string;
  readonly tick: string | null;
  readonly agents: Readonly<Partial<Record<Agent, number>>>;
  readonly tokens: number;
}

export interface BurnView {
  readonly tokens: number;
  readonly agents: readonly AgentLine[];
  readonly bars: readonly Bar[];
  readonly kinds: TokenKinds;
  readonly projects: readonly Share[];
  readonly models: readonly Share[];
  readonly untracked: number;
}

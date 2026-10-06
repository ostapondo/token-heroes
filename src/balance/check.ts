import type { Content } from '@content';
import type { PartyState, Roster } from '@engine';
import { judge, type Finding } from './rules';
import { heroSheet, stageSheet, type StageSheet } from './sheets';
import { runParty, type RunOptions, type RunReport } from './simulate';

interface Member {
  readonly heroId: string;
  readonly level: number;
}

export interface Scenario {
  readonly name: string;
  readonly party: readonly Member[];
}

export interface Verdict {
  readonly scenario: string;
  readonly party: readonly Member[];
  readonly run: RunReport;
  readonly frontier: StageSheet | null;
  readonly findings: readonly Finding[];
}

export interface BalanceReport {
  readonly passed: number;
  readonly failed: number;
  readonly verdicts: readonly Verdict[];
}

// A party grows the way players grow it: the next heroes in hiring order, levelled together.
const STANDARD = [
  { heroes: 3, level: 10 },
  { heroes: 4, level: 25 },
  { heroes: 5, level: 50 },
  { heroes: Infinity, level: 100 },
  { heroes: Infinity, level: 150 },
] as const;

export function standardScenarios(content: Content): Scenario[] {
  return STANDARD.map(({ heroes, level }) => {
    const party = content.heroes.slice(0, heroes).map((hero) => ({ heroId: hero.id, level }));

    return { name: `${party.length} heroes at level ${level}`, party };
  });
}

export function judgeParty(roster: Roster, scenario: Scenario, options: RunOptions = {}): Verdict {
  const party: PartyState = { heroes: scenario.party.map((member) => ({ ...member })) };
  const run = runParty(party, roster, options);
  const frontier = run.frontier ? stageSheet(roster, run.frontier.stage) : null;
  const heroes = scenario.party.map((member) => heroSheet(roster, member.heroId, member.level));

  return {
    scenario: scenario.name,
    party: scenario.party,
    run,
    frontier,
    findings: judge({ heroes, run, frontier }),
  };
}

export function checkBalance(roster: Roster, scenarios: readonly Scenario[]): BalanceReport {
  const verdicts = scenarios.map((scenario) => judgeParty(roster, scenario));
  const findings = verdicts.flatMap((verdict) => verdict.findings);

  return {
    passed: findings.filter((finding) => finding.passed).length,
    failed: findings.filter((finding) => !finding.passed).length,
    verdicts,
  };
}

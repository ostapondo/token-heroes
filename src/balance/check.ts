import { partyVitals, type PartyState, type Roster } from '@engine';
import { compact } from './numbers';
import { PACE_COINS, paceCurve, partyFor, type PacePoint } from './pace';
import { greedyPartyFor } from './greedy';
import { PACE_RULES } from './pace-rules';
import { PLAY_RULES } from './play-rules';
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
  readonly pace: {
    readonly steady: readonly PacePoint[];
    readonly greedy: readonly PacePoint[];
    readonly findings: readonly Finding[];
  };
  readonly verdicts: readonly Verdict[];
}

function judgePace(roster: Roster): BalanceReport['pace'] {
  const steady = paceCurve(roster);
  const greedy = paceCurve(roster, greedyPartyFor);
  const findings = [...PACE_RULES, ...PLAY_RULES].map((rule) => ({
    rule: rule.id,
    threshold: rule.threshold,
    ...rule.judge({ roster, steady, greedy }),
  }));

  return { steady, greedy, findings };
}

// The parties a player owns after the burns the pace rules name, so a new hero or a new price
// changes the parties that are judged.
export function standardScenarios(roster: Roster): Scenario[] {
  return PACE_COINS.map((coins) => {
    const party = partyFor(roster, coins);

    return { name: `party after ${compact(coins)} burned tokens`, party: party.heroes };
  });
}

export function judgeParty(roster: Roster, scenario: Scenario, options: RunOptions = {}): Verdict {
  const party: PartyState = { heroes: scenario.party.map((member) => ({ ...member })) };
  const run = runParty(party, roster, options);
  const frontier = run.frontier ? stageSheet(roster, run.frontier.stage) : null;
  const vitals = partyVitals(party, roster);
  const heroes = scenario.party.map((member) =>
    heroSheet(roster, member.heroId, member.level, vitals),
  );

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
  const pace = judgePace(roster);
  const findings = [...pace.findings, ...verdicts.flatMap((verdict) => verdict.findings)];

  return {
    passed: findings.filter((finding) => finding.passed).length,
    failed: findings.filter((finding) => !finding.passed).length,
    pace,
    verdicts,
  };
}

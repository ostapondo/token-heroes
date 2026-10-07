import {
  BattleEventType,
  BattlePhase,
  startStage,
  stepBattle,
  strike,
  type BattleEvent,
  type BattleState,
  type PartyState,
  type Roster,
} from '@engine';

export interface RunOptions {
  readonly fromStage?: number;
  readonly maxSeconds?: number;
  readonly strikesPerSecond?: number;
}

interface Frontier {
  readonly stage: number;
  readonly foeHpLeft: number;
  readonly secondsSurvived: number;
}

export interface RunReport {
  readonly fromStage: number;
  readonly stagesCleared: number;
  readonly frontier: Frontier | null;
  readonly wipesBeforeFrontier: number;
  readonly secondsSimulated: number;
  readonly damageDealt: number;
  readonly skillDamage: number;
  readonly healingDone: number;
  readonly damageTaken: number;
  // Casts of each hero's skills in the fight that stopped the party.
  readonly frontierCasts: Readonly<Record<string, number>>;
}

// The game ticks every 0.1 s; a quarter second keeps runs of hours fast and changes no outcome
// that matters here. A stage that wipes the party twice in a row is where it is stuck.
const TICK_SECONDS = 0.25;
const ATTEMPTS_BEFORE_STUCK = 2;
const DEFAULT_MAX_SECONDS = 3 * 60 * 60;

interface Tally {
  stagesCleared: number;
  wipes: number;
  damageDealt: number;
  skillDamage: number;
  healingDone: number;
  damageTaken: number;
  casts: Record<string, number>;
}

function count(tally: Tally, event: BattleEvent): void {
  switch (event.type) {
    case BattleEventType.Hit:
    case BattleEventType.Strike:
    case BattleEventType.Ultimate:
      tally.damageDealt += event.amount;
      break;
    case BattleEventType.SkillTick:
      tally.damageDealt += event.amount;
      tally.skillDamage += event.amount;
      break;
    case BattleEventType.Skill: {
      const dealt = event.hits.reduce((sum, hit) => sum + hit.amount, 0);

      tally.damageDealt += dealt;
      tally.skillDamage += dealt;
      tally.healingDone += event.heal ?? 0;
      tally.casts[event.source] = (tally.casts[event.source] ?? 0) + 1;
      break;
    }
    case BattleEventType.Heal:
      tally.healingDone += event.amount;
      break;
    case BattleEventType.PartyHit:
      tally.damageTaken += event.amount;
      break;
    case BattleEventType.StageCleared:
      tally.stagesCleared += 1;
      break;
    case BattleEventType.Wiped:
      tally.wipes += 1;
      break;
    case BattleEventType.StageStarted:
    case BattleEventType.Respawned:
      tally.casts = {};
      break;
    case BattleEventType.FoeDefeated:
    case BattleEventType.Mechanic:
      break;
  }
}

const foeHpLeft = (battle: BattleState): number =>
  battle.foes.reduce((sum, foe) => sum + foe.hp, 0) /
  Math.max(
    1,
    battle.foes.reduce((sum, foe) => sum + foe.maxHp, 0),
  );

export function runParty(party: PartyState, roster: Roster, options: RunOptions = {}): RunReport {
  const fromStage = options.fromStage ?? 1;
  const maxSeconds = options.maxSeconds ?? DEFAULT_MAX_SECONDS;
  const strikeEvery = options.strikesPerSecond ? 1 / options.strikesPerSecond : Infinity;
  const tally: Tally = {
    stagesCleared: 0,
    wipes: 0,
    damageDealt: 0,
    skillDamage: 0,
    healingDone: 0,
    damageTaken: 0,
    casts: {},
  };
  let battle = startStage(fromStage, party, roster, { seed: 1, ultimate: 0 });
  let elapsed = 0;
  let sinceStrike = 0;
  let inFight = 0;
  let failures = 0;
  let frontier: Frontier | null = null;

  while (elapsed < maxSeconds && !frontier) {
    sinceStrike += TICK_SECONDS;
    if (sinceStrike >= strikeEvery && battle.phase === BattlePhase.Fighting) {
      sinceStrike = 0;
      const struck = strike(battle, party, roster);

      battle = struck.battle;
      for (const event of struck.events) count(tally, event);
    }
    const stage = battle.stage;
    const step = stepBattle(battle, TICK_SECONDS, party, roster);

    for (const event of step.events) {
      count(tally, event);
      if (event.type === BattleEventType.StageCleared) failures = 0;
      if (event.type === BattleEventType.Wiped) {
        failures += 1;
        if (failures >= ATTEMPTS_BEFORE_STUCK) {
          frontier = {
            stage,
            foeHpLeft: foeHpLeft(step.battle),
            secondsSurvived: inFight,
          };
        }
      }
    }
    inFight = step.battle.phase === BattlePhase.Fighting ? inFight + TICK_SECONDS : 0;
    battle = step.battle;
    elapsed += TICK_SECONDS;
  }

  return {
    fromStage,
    stagesCleared: tally.stagesCleared,
    frontier,
    wipesBeforeFrontier: tally.wipes - (frontier ? ATTEMPTS_BEFORE_STUCK : 0),
    secondsSimulated: elapsed,
    damageDealt: tally.damageDealt,
    skillDamage: tally.skillDamage,
    healingDone: tally.healingDone,
    damageTaken: tally.damageTaken,
    frontierCasts: frontier ? tally.casts : {},
  };
}

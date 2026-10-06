import { stepBattle } from './battle/step';
import {
  AttackStyle,
  type BattleEvent,
  type BattleState,
  HeroRole,
  type HeroStats,
  type PartyState,
  type Roster,
} from './types';

function hero(
  id: string,
  role: HeroRole,
  attack: AttackStyle,
  overrides: Partial<HeroStats> = {},
): HeroStats {
  return {
    id,
    role,
    attack,
    baseDamage: 10,
    baseHp: 50,
    attackInterval: 1,
    levelCostBase: 10,
    hireCost: 0,
    unlockAtTokens: 0,
    ...overrides,
  };
}

export const testRoster: Roster = {
  heroes: [
    hero('knight', HeroRole.Striker, AttackStyle.Slash),
    hero('cleric', HeroRole.Healer, AttackStyle.Heal, { baseDamage: 5 }),
    hero('guard', HeroRole.Tank, AttackStyle.Bash, { baseDamage: 1, baseHp: 400 }),
  ],
  bosses: [{ id: 'dragon', element: 'fire', hpScale: 1, damageScale: 1 }],
  enemies: [
    { id: 'bat', hpScale: 1, damageScale: 1 },
    { id: 'rat', hpScale: 1, damageScale: 1 },
  ],
};

export function partyOf(
  ...slots: readonly (readonly [heroId: string, level: number])[]
): PartyState {
  return { heroes: slots.map(([heroId, level]) => ({ heroId, level })) };
}

export function runFor(
  battle: BattleState,
  seconds: number,
  party: PartyState,
  dt = 0.1,
): { battle: BattleState; events: BattleEvent[] } {
  let current = battle;
  const events: BattleEvent[] = [];

  for (let elapsed = 0; elapsed < seconds - 1e-9; elapsed += dt) {
    const step = stepBattle(current, dt, party, testRoster);

    current = step.battle;
    events.push(...step.events);
  }

  return { battle: current, events };
}

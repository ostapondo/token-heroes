import { BALANCE } from '../balance';
import { safeAmount } from '../formulas';
import { nextRandom } from '../random';
import { type BattleEvent, BattleEventType, BossMechanic } from '../types';
import { type BattleDraft, type FoeDraft, frontFoe } from './draft';

const RULES = BALANCE.mechanics;
const LANDS_NOTHING = new Set<BossMechanic>([BossMechanic.Hallucinate, BossMechanic.Inject]);

// How much harder a mechanic makes the fight: a share of the party's hits lost, a pause in its
// attacks, health won back or a harder hit for part of the fight. Stealing the ultimate costs
// nothing here, since the ultimate is a bonus for active play.
const WEIGHT: Readonly<Record<BossMechanic, number>> = {
  [BossMechanic.StealContext]: 1,
  [BossMechanic.Hallucinate]: 1 / (1 - RULES.hallucinate.share),
  [BossMechanic.Inject]: 1 / (1 - 2 * RULES.inject.share),
  [BossMechanic.Flatter]: 1 + BALANCE.critChance * (BALANCE.critMultiplier - 1),
  [BossMechanic.Throttle]: RULES.throttle.every / (RULES.throttle.every - RULES.throttle.pause),
  [BossMechanic.Loop]: 1 + RULES.loop.back - RULES.loop.at,
  [BossMechanic.Unmask]: 1 - RULES.unmask.at + RULES.unmask.at * RULES.unmask.damage,
  [BossMechanic.Maximize]: 1 / RULES.maximize.kept,
};

export const mechanicWeight = (mechanic: BossMechanic | undefined): number =>
  mechanic ? WEIGHT[mechanic] : 1;

const twist = (mechanic: BossMechanic, foe: number, amount: number): BattleEvent => ({
  type: BattleEventType.Mechanic,
  mechanic,
  foe,
  amount,
});

// A wounded super boss may loop back to more health or drop its mask and hit harder, once.
function afterWound(foe: FoeDraft, index: number, events: BattleEvent[]): void {
  if (foe.spent) return;
  if (foe.mechanic === BossMechanic.Loop && foe.hp <= foe.maxHp * RULES.loop.at) {
    const back = safeAmount(foe.maxHp * RULES.loop.back);

    events.push(twist(BossMechanic.Loop, index, back - foe.hp));
    foe.hp = back;
    foe.spent = true;
  }
  if (foe.mechanic === BossMechanic.Unmask && foe.hp <= foe.maxHp * RULES.unmask.at) {
    foe.damage = safeAmount(foe.damage * RULES.unmask.damage);
    foe.spent = true;
    events.push(twist(BossMechanic.Unmask, index, foe.damage));
  }
}

export function damageFront(
  draft: BattleDraft,
  amount: number,
  events: BattleEvent[],
  hitEvent: (foe: number, amount: number) => BattleEvent,
): void {
  const index = frontFoe(draft);
  const foe = draft.foes[index];

  if (!foe) return;
  const landed =
    foe.mechanic === BossMechanic.Maximize ? safeAmount(amount * RULES.maximize.kept) : amount;

  foe.hp = Math.max(0, foe.hp - landed);
  events.push(hitEvent(index, landed));
  if (foe.hp === 0) events.push({ type: BattleEventType.FoeDefeated, foe: index, boss: foe.boss });
  else afterWound(foe, index, events);
}

// A hero's hit, unless the front foe makes it land on nothing, heal it, or flatter a crit away.
export function heroHit(
  draft: BattleDraft,
  source: string,
  power: number,
  crit: boolean,
  events: BattleEvent[],
): void {
  const index = frontFoe(draft);
  const foe = draft.foes[index];
  const mechanic = foe?.mechanic;

  if (foe && mechanic && LANDS_NOTHING.has(mechanic)) {
    const [roll, seed] = nextRandom(draft.seed);

    draft.seed = seed;
    if (mechanic === BossMechanic.Hallucinate && roll < RULES.hallucinate.share) {
      events.push(twist(mechanic, index, power));

      return;
    }
    if (mechanic === BossMechanic.Inject && roll < RULES.inject.share) {
      foe.hp = Math.min(foe.maxHp, foe.hp + power);
      events.push(twist(mechanic, index, power));

      return;
    }
  }
  const flattered = crit && mechanic === BossMechanic.Flatter;

  if (flattered) events.push(twist(BossMechanic.Flatter, index, power));
  const landsCrit = crit && !flattered;
  const amount = landsCrit ? safeAmount(power * BALANCE.critMultiplier) : power;

  damageFront(draft, amount, events, (target, landed) => ({
    type: BattleEventType.Hit,
    source,
    foe: target,
    amount: landed,
    crit: landsCrit,
  }));
}

// Every few seconds the front foe may hold the party's attacks back for a moment.
export function throttled(draft: BattleDraft, dt: number, events: BattleEvent[]): boolean {
  const index = frontFoe(draft);
  const foe = draft.foes[index];

  if (foe?.mechanic !== BossMechanic.Throttle) return false;
  const { every, pause } = RULES.throttle;
  const before = foe.clock ?? 0;
  const after = before + dt;
  const opens = every - pause;

  foe.clock = after;
  if (Math.floor((after - opens) / every) > Math.floor((before - opens) / every)) {
    events.push(twist(BossMechanic.Throttle, index, pause));
  }

  return after % every >= opens;
}

// A foe that steals context drains the ultimate with every hit.
export function stealContext(
  draft: BattleDraft,
  foe: FoeDraft,
  index: number,
  events: BattleEvent[],
): void {
  if (foe.mechanic !== BossMechanic.StealContext || draft.ultimate <= 0) return;
  const stolen = Math.min(draft.ultimate, RULES.stealContext.share);

  draft.ultimate -= stolen;
  events.push(twist(BossMechanic.StealContext, index, stolen));
}

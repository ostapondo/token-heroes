import { BALANCE } from '../balance';
import { type BattleDraft, frontFoe } from '../battle/draft';
import { damageAt, heroHit } from '../battle/mechanics';
import { safeAmount } from '../formulas';
import { type BattleEvent, BattleEventType } from '../types';
import { asDamage, asHeldSeconds, asPartySeconds, asProtection, type FightRates } from './budget';
import { tiered } from './ranks';
import {
  type FoeBurn,
  type SkillEffect,
  SkillEffectKind,
  type SkillHit,
  type SkillStats,
} from './types';

const RULES = BALANCE.skills;

export interface Cast {
  readonly source: string;
  readonly skill: SkillStats;
  readonly rank: number;
  readonly healer: boolean;
  readonly budget: number;
  readonly rates: FightRates;
  // The foe the cast aims at: the front one, or the foe a counter answers.
  readonly target: number;
  readonly deflected?: number;
}

interface Outcome {
  hits: SkillHit[];
  stun?: number;
  mark?: number;
  shield?: number;
  heal?: number;
}

// A new burn on a burning foe keeps what the old one had left to deal, so no budget is lost.
function rekindled(old: FoeBurn | undefined, damage: number, seconds: number, cast: Cast): FoeBurn {
  const left = Math.max(seconds, old?.left ?? 0);
  const owed = (old ? old.perSecond * old.left : 0) + damage;

  return {
    left,
    perSecond: owed / left,
    tickIn: old?.tickIn ?? RULES.burnTick,
    source: cast.source,
    skill: cast.skill.id,
  };
}

// The target and up to reach more living foes behind it; a boss fight has no one else.
function targetsOf(draft: BattleDraft, target: number, reach: number): number[] {
  const others = draft.foes
    .map((foe, index) => ({ foe, index }))
    .filter(({ foe, index }) => foe.hp > 0 && index !== target)
    .slice(0, reach)
    .map(({ index }) => index);

  return [target, ...others];
}

function strike(
  draft: BattleDraft,
  cast: Cast,
  amount: number,
  outcome: Outcome,
  events: BattleEvent[],
) {
  const record = (foe: number, dealt: number) => outcome.hits.push({ foe, amount: dealt });

  if (cast.target === frontFoe(draft)) heroHit(draft, amount, false, events, record);
  else damageAt(draft, cast.target, amount, events, record);
}

function apply(
  draft: BattleDraft,
  cast: Cast,
  effect: SkillEffect,
  outcome: Outcome,
  events: BattleEvent[],
): void {
  if (effect.kind === SkillEffectKind.Deflect) return;
  const damage = asDamage(cast.budget * effect.share, cast.healer, cast.rates);
  const reach = 'reach' in effect ? tiered(effect.reach, cast.rank) : 0;
  const targets = targetsOf(draft, cast.target, reach);

  switch (effect.kind) {
    case SkillEffectKind.Hit: {
      const spread = effect.spread ?? 0;

      strike(draft, cast, damage, outcome, events);
      for (const index of targets.slice(1)) {
        damageAt(draft, index, damage * spread, events, (foe, dealt) =>
          outcome.hits.push({ foe, amount: dealt }),
        );
      }
      break;
    }
    case SkillEffectKind.Burn:
      for (const index of targets) {
        const foe = draft.foes[index];

        if (foe) foe.burn = rekindled(foe.burn, damage, effect.seconds, cast);
      }
      break;
    case SkillEffectKind.Stun: {
      const seconds = Math.min(RULES.stunCap, asHeldSeconds(damage, cast.rates));

      for (const index of targets) {
        const foe = draft.foes[index];

        if (foe) {
          foe.attackIn += seconds;
          foe.stunned = Math.max(foe.stunned ?? 0, seconds);
        }
      }
      outcome.stun = seconds;
      break;
    }
    case SkillEffectKind.Mark: {
      const bonus = Math.min(RULES.markCap, asPartySeconds(damage, cast.rates) / effect.seconds);

      for (const index of targets) {
        const foe = draft.foes[index];

        if (foe) foe.mark = { left: effect.seconds, bonus };
      }
      outcome.mark = bonus;
      break;
    }
    case SkillEffectKind.Shield: {
      const amount = safeAmount(asProtection(damage, cast.rates));

      draft.shield = { amount, left: tiered(effect.seconds, cast.rank), skill: cast.skill.id };
      outcome.shield = amount;
      break;
    }
    case SkillEffectKind.Heal: {
      const amount = safeAmount(asProtection(damage, cast.rates));

      draft.partyHp += amount;
      outcome.heal = amount;
      break;
    }
  }
}

// A cast spends its budget across its effects and reports them as one Skill event, ahead of the
// foes it fells, so the arena draws the blow before the fall.
export function castSkill(
  draft: BattleDraft,
  cast: Cast,
  events: BattleEvent[],
  maxHp: number,
): void {
  const outcome: Outcome = { hits: [] };
  const after: BattleEvent[] = [];

  for (const effect of cast.skill.effects) apply(draft, cast, effect, outcome, after);
  draft.partyHp = Math.min(maxHp, draft.partyHp);
  events.push({
    type: BattleEventType.Skill,
    source: cast.source,
    skill: cast.skill.id,
    rank: cast.rank,
    target: cast.target,
    ...outcome,
    ...(cast.deflected === undefined ? {} : { deflected: cast.deflected }),
  });
  events.push(...after);
}

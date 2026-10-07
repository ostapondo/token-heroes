import { SkillEffectKind, tiered } from '@engine';
import type { SkillChip } from '../types';

const PERCENT = 100;

function unknownEffect(effect: never): never {
  throw new Error(`No fact describes the skill effect ${JSON.stringify(effect)}`);
}

export type SkillFact =
  | { readonly kind: 'hit'; readonly amount: number }
  | { readonly kind: 'reach'; readonly count: number; readonly percent: number }
  | { readonly kind: 'burn'; readonly seconds: number }
  | { readonly kind: 'stun' }
  | { readonly kind: 'mark'; readonly seconds: number }
  | { readonly kind: 'shield'; readonly seconds: number }
  | { readonly kind: 'heal' }
  | { readonly kind: 'deflect' };

// What a skill does at its current form; a locked skill is shown as it opens.
export function skillFacts(chip: SkillChip): SkillFact[] {
  const rank = Math.max(chip.rank, 1);

  return chip.effects.flatMap((effect): SkillFact[] => {
    switch (effect.kind) {
      case SkillEffectKind.Hit: {
        const count = tiered(effect.reach, rank);
        const reach: SkillFact[] =
          count > 0
            ? [{ kind: 'reach', count, percent: Math.round((effect.spread ?? 0) * PERCENT) }]
            : [];

        return [
          ...(chip.hit === null ? [] : [{ kind: 'hit', amount: chip.hit } as const]),
          ...reach,
        ];
      }
      case SkillEffectKind.Burn:
        return [{ kind: 'burn', seconds: effect.seconds }];
      case SkillEffectKind.Stun:
        return [{ kind: 'stun' }];
      case SkillEffectKind.Mark:
        return [{ kind: 'mark', seconds: effect.seconds }];
      case SkillEffectKind.Shield:
        return [{ kind: 'shield', seconds: tiered(effect.seconds, rank) }];
      case SkillEffectKind.Heal:
        return [{ kind: 'heal' }];
      case SkillEffectKind.Deflect:
        return [{ kind: 'deflect' }];
      default:
        return unknownEffect(effect);
    }
  });
}

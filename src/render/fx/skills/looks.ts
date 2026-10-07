import { SkillLook } from '@content';
import { FX_COLOR } from '../colors';
import { backstab, counter, leapSlam, piercing, snipe, warding, whirlwind } from './looks-ground';
import { arrowRain, frostSpikes, justice, lightning, meteor, sanctuary } from './looks-sky';
import type { LookPlan, LookScene } from './plan';

function unknownLook(look: never): never {
  throw new Error(`No effect draws the skill look ${String(look)}`);
}

export function skillLook(look: SkillLook, scene: LookScene): LookPlan {
  switch (look) {
    case SkillLook.CallLightning:
      return lightning(scene);
    case SkillLook.Meteor:
      return meteor(scene);
    case SkillLook.ArrowRain:
      return arrowRain(scene);
    case SkillLook.Justice:
      return justice(scene);
    case SkillLook.Sanctuary:
      return sanctuary(scene);
    case SkillLook.GlacialSpike:
      return frostSpikes(scene);
    case SkillLook.Whirlwind:
      return whirlwind(scene);
    case SkillLook.LeapSlam:
      return leapSlam(scene);
    case SkillLook.Crusade:
      return piercing(scene, [FX_COLOR.gold, FX_COLOR.holy], scene.tier === 2 ? 5 : 3);
    case SkillLook.PinningShot:
      return piercing(scene, ['#c08a4a', FX_COLOR.steel], 1);
    case SkillLook.Snipe:
      return snipe(scene);
    case SkillLook.Backstab:
      return backstab(scene);
    case SkillLook.Counter:
      return counter(scene);
    case SkillLook.Bulwark:
    case SkillLook.RaiseDead:
      return warding(scene);
    default:
      return unknownLook(look);
  }
}

import { type Content, SkillLook, skillDefById } from '@content';
import {
  type BattleState,
  heroById,
  type PartyState,
  type Roster,
  skillRank,
  SkillTrigger,
} from '@engine';
import type { Actor } from '../scene/cast';
import { center } from '../scene/geometry';
import { MotionCue } from '../scene/motion';
import type { Effect } from './effect';
import { Gathering, Target } from './skills/auras';
import { AimLine } from './skills/strokes';

// Seconds before a cast the hero starts to gather it: anticipation before the blow.
const LEAD_SECONDS = 0.45;
const FROM_THE_SKY = new Set<SkillLook>([
  SkillLook.CallLightning,
  SkillLook.Meteor,
  SkillLook.Justice,
]);

interface Stage {
  readonly heroes: readonly Actor[];
  readonly foes: readonly Actor[];
}

// Each timed skill telegraphs once per cooldown: its hero glows and gathers light, a skill from
// the sky marks its spot, and a charged shot draws its aim.
export class Telegraphs {
  readonly #content: Content;
  readonly #roster: Roster;
  readonly #armed = new Set<string>();

  constructor(content: Content, roster: Roster) {
    this.#content = content;
    this.#roster = roster;
  }

  update(battle: BattleState, party: PartyState, stage: Stage): Effect[] {
    const front = battle.foes.findIndex((foe) => foe.hp > 0);
    const target = stage.foes[front];

    return party.heroes.flatMap((slot) => {
      const hero = stage.heroes.find((actor) => actor.id === slot.heroId);

      if (!hero) return [];

      return heroById(this.#roster, slot.heroId).skills.flatMap((stats) => {
        const skill = skillDefById(this.#content, stats.id);
        const state = battle.skills?.[skill.id];
        const lead = skill.charge ?? LEAD_SECONDS;
        const live =
          skill.trigger === SkillTrigger.Cooldown && skillRank(slot.level, stats.lag) > 0;

        if (!state || !live) return [];
        if (state.readyIn > lead) {
          this.#armed.delete(skill.id);

          return [];
        }
        if (this.#armed.has(skill.id) || !target) return [];
        this.#armed.add(skill.id);
        hero.motion.cue(MotionCue.Glow);
        const around = () => center(hero.box);

        return [
          new Gathering(around, skill.color, lead),
          ...(FROM_THE_SKY.has(skill.look)
            ? [
                new Target(
                  { x: center(target.box).x, y: target.box.y + target.box.height },
                  Math.max(8, target.box.width / 2),
                  skill.color,
                  lead + 0.1,
                ),
              ]
            : []),
          ...(skill.charge
            ? [new AimLine(around, () => center(target.box), skill.color, lead)]
            : []),
        ];
      });
    });
  }
}

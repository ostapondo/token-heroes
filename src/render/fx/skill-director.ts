import { type Content, type ElementDef, skillDefById } from '@content';
import { type BattleEventType, formTier, heroById, rankedSkills, type Roster } from '@engine';
import { t } from '@i18n';
import { compactNumber, rankNumeral } from '../format';
import type { Actor } from '../scene/cast';
import { center, type Point } from '../scene/geometry';
import { MotionCue } from '../scene/motion';
import { Sparks } from './bursts';
import { FX_COLOR } from './colors';
import type { Effect } from './effect';
import { FloatingText } from './floating-text';
import { NONE, type EventOf, type Reaction } from './reaction';
import { Later } from './skills/later';
import { skillLook } from './skills/looks';
import { middleOf } from './skills/plan';
import { SkillBanner, SkillText } from './skills/text';
import { TEXT } from './text-styles';

type SkillEvent = EventOf<typeof BattleEventType.Skill>;
type TickEvent = EventOf<typeof BattleEventType.SkillTick>;

interface Stage {
  readonly heroes: readonly Actor[];
  readonly foes: readonly Actor[];
  readonly element: ElementDef;
}

const NUMBER = { main: 16, other: 11, label: 8 } as const;
const BANNER_COLOR = { form: FX_COLOR.gold, evolved: '#c9a6ff' } as const;
const GUARD_TEXT = { color: FX_COLOR.steel, size: 14 } as const;

// Just ahead of the party's front rank, where a blow from the foes lands.
function partyFront(heroes: readonly Actor[]): Point {
  const right = Math.max(...heroes.map((hero) => hero.box.x + hero.box.width));
  const top = Math.min(...heroes.map((hero) => hero.box.y));

  return { x: right - 6, y: top - 4 };
}

// How the arena shows a skill: its look, then its numbers as the blow lands.
export class SkillDirector {
  readonly #content: Content;
  readonly #roster: Roster;

  constructor(content: Content, roster: Roster) {
    this.#content = content;
    this.#roster = roster;
  }

  cast(event: SkillEvent, stage: Stage): Reaction {
    const hero = stage.heroes.find((actor) => actor.id === event.source);

    if (!hero) return NONE;
    if (event.parried !== undefined) return parry(event.parried, stage.heroes);
    const skill = skillDefById(this.#content, event.skill);
    const tier = formTier(event.rank);
    const name = (tier === 2 ? skill.evolved : skill.name).toUpperCase();
    const struck = [event.target, ...event.hits.map((hit) => hit.foe)].filter(
      (foe, index, all) => all.indexOf(foe) === index,
    );
    const targets = struck.flatMap((foe) => stage.foes[foe] ?? []);
    const look = skillLook(skill.look, {
      hero,
      heroes: stage.heroes,
      targets,
      color: skill.color,
      tier,
      element: stage.element,
    });
    const numbers = new Later(look.lands, () =>
      event.hits.flatMap((hit, index) => {
        const foe = stage.foes[hit.foe];

        if (!foe) return [];
        foe.motion.cue(MotionCue.Flash);
        const main = index === 0;
        const at = { x: middleOf(foe).x, y: foe.box.y - 6 };

        return [
          new SkillText(compactNumber(hit.amount), at, {
            color: skill.color,
            size: main ? NUMBER.main : NUMBER.other,
            ...(main ? { label: name } : {}),
          }),
        ];
      }),
    );

    return {
      effects: [...look.effects, numbers, ...extras(event, stage.heroes, hero, skill.color, name)],
      ground: look.ground,
      shake: look.shake,
      ...(look.flash ? { beat: { flash: look.flash, hitstop: look.hitstop ?? 0 } } : {}),
    };
  }

  // A level that opens a skill or ranks one up shows it across the arena.
  ranked(heroId: string, level: number): Effect[] {
    return rankedSkills(heroById(this.#roster, heroId), level - 1, level).map(
      ({ skill: stats, rank }) => {
        const skill = skillDefById(this.#content, stats.id);
        const evolved = formTier(rank) === 2;
        const name = (evolved ? skill.evolved : skill.name).toUpperCase();
        const title =
          rank === 1
            ? t('arena.skill.new')
            : t('arena.skill.rank', { name, rank: rankNumeral(rank) });

        return new SkillBanner(
          title,
          rank === 1 ? name : '',
          evolved ? BANNER_COLOR.evolved : BANNER_COLOR.form,
        );
      },
    );
  }

  tick(event: TickEvent, stage: Stage): Reaction {
    const foe = stage.foes[event.foe];

    if (!foe) return NONE;
    const at = { x: middleOf(foe).x + 6, y: foe.box.y + 2 };

    return { effects: [new FloatingText(compactNumber(event.amount), at, TEXT.burn)], shake: 0 };
  }
}

// A cast that heals, shields or makes a blow miss says so over the party.
function extras(
  event: SkillEvent,
  heroes: readonly Actor[],
  hero: Actor,
  color: string,
  name: string,
): Effect[] {
  const front = partyFront(heroes);
  const effects: Effect[] = [];

  if (event.heal) {
    for (const each of heroes) each.motion.cue(MotionCue.Glow);
    effects.push(
      new SkillText(`+${compactNumber(event.heal)}`, front, {
        color: FX_COLOR.heal,
        size: 15,
        label: name,
      }),
    );
  }
  if (event.shield) {
    effects.push(
      new SkillText(
        compactNumber(event.shield),
        { x: center(hero.box).x + 10, y: hero.box.y - 8 },
        { color, size: 14, label: name },
      ),
    );
  }
  if (event.deflected !== undefined) {
    effects.push(
      new SkillText(t('arena.miss'), { x: front.x - 8, y: front.y - 2 }, GUARD_TEXT),
      new Sparks({ x: front.x, y: front.y + 14 }, [FX_COLOR.steel, FX_COLOR.charge], {
        count: 8,
        reach: 16,
      }),
    );
  }

  return effects;
}

function parry(amount: number, heroes: readonly Actor[]): Reaction {
  const front = partyFront(heroes);

  return {
    effects: [
      new SkillText(t('arena.parry'), { x: front.x - 8, y: front.y - 2 }, GUARD_TEXT),
      new FloatingText(
        `-${compactNumber(amount)}`,
        { x: front.x - 8, y: front.y + 10 },
        TEXT.block,
      ),
      new Sparks({ x: front.x, y: front.y + 14 }, [FX_COLOR.steel], { count: 6, reach: 12 }),
    ],
    shake: 1,
  };
}

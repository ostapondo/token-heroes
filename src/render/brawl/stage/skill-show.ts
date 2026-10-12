import { heroDefById, skillDefById, type SkillLook } from '@content';
import { formTier, heroById, rankedSkills, type BattleEvent, type BattleEventType } from '@engine';
import { t } from '@i18n';
import { compactNumber, rankNumeral } from '../../format';
import type { Point } from '../../geometry';
import { Move } from '../rig/poses';
import type { Body } from './body';
import { hitMark, type Numbers } from './blows';
import { mend } from './bursts';
import { PLANS } from './skill-looks';
import { COLOR, TEXT } from './styles';
import { top, type World } from './world';

type SkillEvent = Extract<BattleEvent, { type: typeof BattleEventType.Skill }>;

const SWING = 0.55;
const NUMBER = { main: 26, other: 18 } as const;

// How the arena shows a skill: the hero's move, the skill's look, then its numbers as it lands.
export class SkillShow {
  readonly #world: World;
  readonly #numbers: Numbers;

  constructor(world: World, numbers: Numbers) {
    this.#world = world;
    this.#numbers = numbers;
  }

  // Blasts push whatever already lies on the floor; standing fighters are left to the rules.
  readonly push = (x: number, y: number, radius: number, force: number): void => {
    for (const body of this.#world.cast.all) if (body.ragdoll) body.launch(x, y, radius, force);
  };

  lookOf(skillId: string): SkillLook {
    return skillDefById(this.#world.content, skillId).look;
  }

  landsAfter(look: SkillLook): number {
    return PLANS[look].lands;
  }

  launchFrom(look: SkillLook, center: Point, dir: number, body: Body): Point {
    return PLANS[look].from?.(center, dir, body) ?? { x: center.x - dir * 22, y: center.y + 12 };
  }

  cast(event: SkillEvent): void {
    const world = this.#world;
    const hero = world.cast.hero(event.source);

    if (!hero) return;
    if (event.parried !== undefined) {
      this.#parry(hero, event);

      return;
    }
    const skill = skillDefById(world.content, event.skill);
    const tier = formTier(event.rank);
    const plan = PLANS[skill.look];
    const struck = [event.target, ...event.hits.map((hit) => hit.foe)].filter(
      (foe, i, all) => all.indexOf(foe) === i,
    );
    const targets = struck.flatMap((index) => world.cast.foe(index) ?? []);
    const name = (tier === 2 ? skill.evolved : skill.name).toUpperCase();
    const at = top(hero);

    if (hero.state === 'stand' && !hero.move) hero.swing(plan.move, plan.time ?? SWING);
    plan.show({ world, hero, targets, color: skill.color, tier, push: this.push });
    world.fx.text(at.x, at.y - 30 * hero.scale, name, { ...TEXT.skill, color: skill.color });
    world.later.after(plan.lands, () => this.#land(event, skill.color));
    this.#extras(event, hero, skill.color);
  }

  ultimate(foeIndex: number, amount: number): void {
    const world = this.#world;

    world.juice.slowFor(0.6);
    world.juice.kick(8);
    world.fx.flash = 1;
    for (const body of world.cast.heroes.values())
      if (body.state === 'stand') body.swing(Move.Cast, 0.7);
    world.cast.foes.forEach((body, i) => {
      if (body.dead) return;
      world.later.after(0.2 + 0.15 * i, () => {
        const x = body.center.x;

        world.vfx.add({ kind: 'beam', x, y: body.ground, width: 18 }, COLOR.evolved, 0.6);
        world.fx.ring(x, body.ground, 60, '201,160,255');
        this.push(x, body.ground + 6, 70, 1000);
      });
    });
    const target = world.cast.foe(foeIndex);

    world.later.after(0.2, () => {
      if (target) hitMark(world, target, 1, false, true);
      this.#numbers.add(world, target, amount, TEXT.ultimate);
    });
  }

  // A level that opens a skill or ranks one up says so over its hero.
  ranked(heroId: string, level: number): void {
    const world = this.#world;
    const hero = world.cast.hero(heroId);

    if (!hero) return;
    rankedSkills(heroById(world.roster, heroId), level - 1, level).forEach(
      ({ skill: stats, rank }, i) => {
        const skill = skillDefById(world.content, stats.id);
        const evolved = formTier(rank) === 2;
        const name = (evolved ? skill.evolved : skill.name).toUpperCase();
        const title =
          rank === 1
            ? `${t('arena.skill.new')} ${name}`
            : t('arena.skill.rank', { name, rank: rankNumeral(rank) });
        const at = top(hero);

        world.fx.text(at.x, at.y - (46 + i * 22) * hero.scale, title, {
          ...TEXT.banner,
          size: 26,
          color: evolved ? COLOR.evolved : COLOR.gold,
        });
      },
    );
  }

  #land(event: SkillEvent, color: string): void {
    const world = this.#world;
    const hero = world.cast.hero(event.source);

    event.hits.forEach((hit, index) => {
      const body = world.cast.foe(hit.foe);

      if (!body) return;
      if (!body.dead)
        hitMark(world, body, hero ? Math.sign(body.center.x - hero.center.x) || 1 : 1, false, true);
      const style = { color, size: index === 0 ? NUMBER.main : NUMBER.other };

      this.#numbers.add(world, body, compactNumber(hit.amount), style);
      if (event.stun && !body.dead && !world.ruleFoe(hit.foe)?.boss)
        body.launch(body.center.x, body.center.y + 14, 60 * body.scale, 520);
    });
  }

  #extras(event: SkillEvent, hero: Body, color: string): void {
    const world = this.#world;
    const at = top(hero);

    if (event.heal) {
      for (const body of world.cast.heroes.values()) {
        if (body.state === 'stand')
          mend(world.fx, top(body).x, top(body).y, heroDefById(world.content, event.source).tint);
      }
      this.#numbers.add(world, hero, `+${compactNumber(event.heal)}`, TEXT.heal);
    }
    if (event.shield)
      world.fx.text(at.x + 16, at.y - 10, compactNumber(event.shield), { color, size: 22 });
    if (event.deflected !== undefined) world.fx.text(at.x, at.y - 20, t('arena.miss'), TEXT.block);
  }

  #parry(hero: Body, event: SkillEvent): void {
    const world = this.#world;
    const foe = world.cast.foe(event.target);
    const at = top(hero);

    if (hero.state === 'stand') hero.swing(Move.Stab, 0.35, 0.5);
    world.fx.text(at.x, at.y - 22, t('arena.parry'), TEXT.block);
    world.fx.text(at.x, at.y - 4, `-${compactNumber(event.parried ?? 0)}`, TEXT.block);
    if (foe)
      PLANS.counter.show({
        world,
        hero,
        targets: [foe],
        color: COLOR.steel,
        tier: 0,
        push: this.push,
      });
  }
}

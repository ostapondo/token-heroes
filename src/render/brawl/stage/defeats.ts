import { BattleEventType, type BattleEvent } from '@engine';
import { t } from '@i18n';
import { throwBody } from './blows';
import { blast } from './bursts';
import { FIELD } from './field';
import type { SkillShow } from './skill-show';
import { COLOR, TEXT } from './styles';
import { missileOf } from './traits';
import { head, type World } from './world';

type DefeatEvent = Extract<BattleEvent, { type: typeof BattleEventType.FoeDefeated }>;

// What dealt a killing blow, found among the events of the same tick.
interface Cause {
  readonly force: number;
  readonly amount: number;
  readonly crit: boolean;
  readonly hero?: string | undefined;
  readonly skill?: string | undefined;
  readonly ranged?: boolean;
}

const FORCE = { skill: 1100, strike: 1000, hit: 750 } as const;
const OVERKILL = { cap: 8, shown: 6, gap: 1.2 } as const;
// The longest a foe's arrow or bolt takes to reach a hero.
const SHOT_FLIGHT = 0.2;

function causeOf(batch: readonly BattleEvent[], index: number, foe: number): Cause {
  const skill = batch
    .slice(index)
    .find(
      (event) => event.type === BattleEventType.Skill && event.hits.some((hit) => hit.foe === foe),
    );

  if (skill?.type === BattleEventType.Skill) {
    const amount = skill.hits.find((hit) => hit.foe === foe)?.amount ?? 0;

    return { force: FORCE.skill, amount, crit: false, hero: skill.source, skill: skill.skill };
  }
  const blow = batch
    .slice(0, index + 1)
    .findLast((event) => 'foe' in event && event.foe === foe && 'amount' in event);

  if (blow?.type === BattleEventType.Hit)
    return { force: FORCE.hit, amount: blow.amount, crit: blow.crit, hero: blow.source };
  if (blow?.type === BattleEventType.Strike || blow?.type === BattleEventType.Ultimate)
    return { force: FORCE.strike, amount: blow.amount, crit: false };

  return { force: FORCE.hit, amount: blow && 'amount' in blow ? blow.amount : 0, crit: false };
}

// Bodies the rules put down: a foe flies as far as the blow outdid it; a hero falls until the
// next stage.
export class Defeats {
  readonly #world: World;
  readonly #skills: SkillShow;
  #overkillAt = -9;

  constructor(world: World, skills: SkillShow) {
    this.#world = world;
    this.#skills = skills;
  }

  defeated(event: DefeatEvent, batch: readonly BattleEvent[], index: number): void {
    const world = this.#world;
    const body = world.cast.foe(event.foe);

    if (!body || body.dead) return;
    body.dead = true;
    body.mayRise = false;
    body.deadFor = 0;
    const cause = causeOf(batch, index, event.foe);
    const hero = cause.hero ? world.cast.hero(cause.hero) : undefined;
    const look = cause.skill ? this.#skills.lookOf(cause.skill) : undefined;
    const ranged = hero && !look && hero.state === 'stand' && missileOf(hero.look) !== null;
    const before = world.previous?.foes[event.foe]?.hp ?? cause.amount;
    const over = Math.min(OVERKILL.cap, cause.amount / Math.max(1, before));
    const last = world.frontIndex === -1;
    const delay = look ? this.#skills.landsAfter(look) : ranged ? 0.16 : 0;

    world.later.after(delay, () => {
      const center = body.center;
      const dir = hero
        ? Math.sign(center.x - hero.center.x) || 1
        : center.x < FIELD.width / 2
          ? -1
          : 1;
      // A blow worth eight times what was left throws the body about twice as far.
      const force =
        cause.force *
        (0.85 + 0.3 * Math.log2(1 + over)) *
        (cause.crit ? 1.3 : 1) *
        (event.boss ? 2.2 : 1);
      const from = look
        ? this.#skills.launchFrom(look, center, dir, body)
        : { x: center.x - dir * 22, y: center.y + 12 };

      throwBody(world, body, from, force, dir);
      if (over >= OVERKILL.shown && world.now - this.#overkillAt > OVERKILL.gap) {
        this.#overkillAt = world.now;
        world.fx.text(center.x, center.y - 40 * body.scale, t('arena.overkill'), {
          ...TEXT.crit,
          color: '#ffb02e',
        });
      }
      if (event.boss) {
        world.juice.slowFor(0.9);
        world.juice.kick(12);
        blast(world.fx, center.x, center.y, 140, world.accent, body.ground);
        world.fx.text(FIELD.width / 2, FIELD.height * 0.32, t('arena.defeated'), {
          ...TEXT.banner,
          color: world.accent,
        });
      }
      // The blow that clears the stage plays slow, with the camera leaning in.
      if (last) {
        world.juice.slowFor(0.45);
        world.juice.punch(center);
      }
    });
  }

  // A hero at no health falls at once and its weapon flies from its hands; struck by a shot, it
  // falls when the shot lands.
  down(heroId: string, foeIndex: number): void {
    const world = this.#world;
    const hero = world.cast.hero(heroId);
    const foe = world.cast.foe(foeIndex);

    if (!hero) return;
    const shot = foe?.state === 'stand' && missileOf(foe.look) !== null;

    hero.mayRise = false;
    world.later.after(shot ? SHOT_FLIGHT : 0, () => {
      const center = hero.center;
      const dir = foe ? Math.sign(center.x - foe.center.x) || 1 : -1;

      throwBody(world, hero, { x: center.x - dir * 16, y: center.y + 10 }, 650, dir);
      const at = head(hero);

      world.fx.text(at.x, at.y - 30, t('arena.down'), {
        ...TEXT.wound,
        size: 26,
        color: COLOR.wound,
      });
    });
  }
}

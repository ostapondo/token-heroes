import { heroDefById } from '@content';
import { BossMechanic, type BattleEvent, type BattleEventType } from '@engine';
import { t } from '@i18n';
import { compactNumber } from '../../format';
import { Move } from '../rig/poses';
import { throwBody } from './blows';
import { sparks } from './bursts';
import { FIELD } from './field';
import type { TextStyle } from './fx';
import type { SkillShow } from './skill-show';
import { COLOR, TEXT } from './styles';
import { head, type World } from './world';

type TwistEvent = Extract<BattleEvent, { type: typeof BattleEventType.Mechanic }>;

// Crits come often in a big party; a flatterer says so on one in this many.
const PRAISE_EVERY = 3;
const MILESTONE = 25;
const KICKS = 4;
const BANNER_Y = FIELD.height * 0.3;

// The fight's turning points: a stage cleared, a party wiped and back, a level bought, a super
// boss's twist.
export class Turns {
  readonly #world: World;
  readonly #skills: SkillShow;
  #flattered = 0;

  constructor(world: World, skills: SkillShow) {
    this.#world = world;
    this.#skills = skills;
  }

  // Some heroes cheer; the ones standing by a body boot it across the floor.
  cleared(): void {
    const world = this.#world;
    let kicks = 0;

    for (const hero of world.cast.heroes.values()) {
      if (hero.state !== 'stand' || hero.move) continue;
      const near =
        kicks < KICKS
          ? world.cast.all.find(
              (body) =>
                body.dead &&
                body.ragdoll &&
                body.alpha > 0.5 &&
                Math.abs(body.center.x - hero.x) < 46 &&
                Math.abs(body.z - hero.z) < 0.25,
            )
          : undefined;

      if (near) {
        kicks += 1;
        hero.facing = near.center.x > hero.x ? 1 : -1;
        hero.swing(Move.Stab, 0.45);
        world.later.after(0.2, () => {
          near.launch(near.center.x - hero.facing * 12, near.ground + 6, 40 * near.scale, 1150);
          near.deadFor = Math.min(near.deadFor, 1);
        });
      } else if (Math.random() < 0.6) {
        hero.cheering = true;
        hero.swing(Move.Cheer, 0.9);
      }
    }
  }

  wiped(): void {
    const world = this.#world;
    const element = world.element;

    if (!element) return;
    world.wipe = { death: element.death, accent: element.accent, t: 0 };
    world.juice.slowFor(1.2);
    for (const hero of world.cast.heroes.values()) {
      hero.mayRise = false;
      const center = hero.center;

      throwBody(
        world,
        hero,
        { x: center.x + (Math.random() - 0.5) * 20, y: hero.ground + 10 },
        380,
        Math.random() < 0.5 ? -1 : 1,
      );
    }
  }

  respawned(): void {
    const world = this.#world;

    world.wipe = null;
    world.cast.renew();
    if (world.battle && world.element)
      world.cast.syncFoes(world.battle, world.element, world.frame);
    for (const hero of world.cast.heroes.values()) hero.disarmed = false;
  }

  celebrate(heroId: string, level: number): void {
    const world = this.#world;
    const hero = world.cast.hero(heroId);

    if (!hero) return;
    const tint = heroDefById(world.content, heroId).tint;
    const milestone = level > 1 && level % MILESTONE === 0;
    const at = head(hero);

    hero.disarmed = false;
    world.vfx.add(
      { kind: 'beam', x: hero.center.x, y: hero.ground, width: milestone ? 16 : 9 },
      milestone ? tint : COLOR.gold,
      milestone ? 0.8 : 0.5,
    );
    world.fx.text(
      at.x,
      at.y - 22 * hero.scale,
      level === 1 ? t('arena.joined') : t('arena.levelUp', { level }),
      { ...TEXT.levelUp, color: milestone ? tint : COLOR.gold },
    );
    if (milestone) {
      world.juice.kick(5);
      world.juice.hold(0.08);
    }
    this.#skills.ranked(heroId, level);
  }

  twist(event: TwistEvent): void {
    const world = this.#world;
    const foe = world.cast.foe(event.foe);
    const at = foe ? head(foe) : { x: FIELD.width / 2, y: BANNER_Y };
    const over = (text: string, style: TextStyle) => world.fx.text(at.x, at.y - 30, text, style);

    switch (event.mechanic) {
      case BossMechanic.Hallucinate:
        over(t('arena.twist.hallucinate'), TEXT.phantom);
        break;
      case BossMechanic.Inject:
        sparks(world.fx, at.x, at.y, 6);
        over(t('arena.twist.inject', { amount: compactNumber(event.amount) }), TEXT.poison);
        break;
      case BossMechanic.Flatter:
        this.#flattered += 1;
        if (this.#flattered % PRAISE_EVERY === 1) over(t('arena.twist.flatter'), TEXT.praise);
        break;
      case BossMechanic.Throttle:
        world.freeze = event.amount;
        this.#banner(t('arena.twist.throttle'), t('arena.twist.throttleNote'), COLOR.wound, 2);
        break;
      case BossMechanic.Loop:
        this.#banner(t('arena.twist.loop'), `+${compactNumber(event.amount)}`, COLOR.poison, 2);
        break;
      case BossMechanic.Unmask:
        if (foe) foe.wobble.kick(0, -1, 160);
        this.#banner(t('arena.twist.unmask'), '', COLOR.wound, 5);
        break;
      case BossMechanic.StealContext:
        over(t('arena.twist.steal', { percent: Math.round(event.amount * 100) }), TEXT.drain);
        break;
      case BossMechanic.Maximize:
        break;
    }
  }

  #banner(title: string, note: string, color: string, shake: number): void {
    const world = this.#world;

    world.fx.flash = Math.max(world.fx.flash, 0.6);
    world.juice.kick(shake);
    world.fx.text(FIELD.width / 2, BANNER_Y, title, { ...TEXT.alarm, color });
    if (note) world.fx.text(FIELD.width / 2, BANNER_Y + 40, note, TEXT.note);
  }
}

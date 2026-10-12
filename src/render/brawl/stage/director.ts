import { heroDefById } from '@content';
import { BattleEventType, type BattleEvent } from '@engine';
import { t } from '@i18n';
import { compactNumber } from '../../format';
import { away, bossBlow, hitMark, Numbers } from './blows';
import { mend } from './bursts';
import { Defeats } from './defeats';
import { SkillShow } from './skill-show';
import { COLOR, TEXT } from './styles';
import { Turns } from './turns';
import { missileOf } from './traits';
import { hand, top, type World } from './world';

type EventOf<T extends BattleEvent['type']> = Extract<BattleEvent, { type: T }>;

// Turns the rules' events into bodies that swing, flinch and fly. It never changes a number.
export class Director {
  readonly #world: World;
  readonly #numbers = new Numbers();
  readonly #skills: SkillShow;
  readonly #defeats: Defeats;
  readonly #turns: Turns;

  constructor(world: World) {
    this.#world = world;
    this.#skills = new SkillShow(world, this.#numbers);
    this.#defeats = new Defeats(world, this.#skills);
    this.#turns = new Turns(world, this.#skills);
  }

  play(events: readonly BattleEvent[]): void {
    events.forEach((event, index) => this.#react(event, events, index));
  }

  celebrate(heroId: string, level: number): void {
    this.#turns.celebrate(heroId, level);
  }

  step(): void {
    this.#numbers.flush(this.#world);
  }

  #react(event: BattleEvent, batch: readonly BattleEvent[], index: number): void {
    switch (event.type) {
      case BattleEventType.Hit:
        this.#hit(event);
        break;
      case BattleEventType.Strike:
        this.#strike(event);
        break;
      case BattleEventType.Ultimate:
        this.#skills.ultimate(event.foe, event.amount);
        break;
      case BattleEventType.Heal:
        this.#heal(event);
        break;
      case BattleEventType.PartyHit:
        this.#partyHit(event);
        break;
      case BattleEventType.SkillTick: {
        const body = this.#world.cast.foe(event.foe);

        this.#numbers.add(this.#world, body, event.amount, TEXT.burn);
        break;
      }
      case BattleEventType.Skill:
        this.#skills.cast(event);
        break;
      case BattleEventType.FoeDefeated:
        this.#defeats.defeated(event, batch, index);
        break;
      case BattleEventType.HeroDown:
        this.#defeats.down(event.hero, event.foe);
        break;
      case BattleEventType.StageCleared:
        this.#turns.cleared();
        break;
      case BattleEventType.StageStarted:
        break;
      case BattleEventType.Wiped:
        this.#turns.wiped();
        break;
      case BattleEventType.Respawned:
        this.#turns.respawned();
        break;
      case BattleEventType.Mechanic:
        this.#turns.twist(event);
        break;
    }
  }

  // A melee blow lands as the swing does; an arrow or a bolt carries its number across.
  #hit(event: EventOf<typeof BattleEventType.Hit>): void {
    const world = this.#world;
    const foe = world.cast.foe(event.foe);
    const hero = world.cast.hero(event.source);

    if (!foe) return;
    const show = () => {
      const dir = away(hero, foe);

      hitMark(world, foe, dir, event.crit, false);
      if (foe.ragdoll)
        foe.launch(
          foe.center.x - dir * 10,
          foe.center.y + 12,
          40 * foe.scale,
          event.crit ? 760 : 460,
        );
      this.#numbers.add(world, foe, event.amount, event.crit ? TEXT.crit : TEXT.hit);
    };
    const missile = hero?.state === 'stand' ? missileOf(hero.look) : null;

    if (hero && missile)
      world.shots.fire(missile, hand(hero), top(foe), hero.tint ?? COLOR.steel, show);
    else show();
  }

  // The player's own blow comes down from the sky and knocks loose bodies about.
  #strike(event: EventOf<typeof BattleEventType.Strike>): void {
    const world = this.#world;
    const foe = world.cast.foe(event.foe);

    if (!foe) return;
    const at = top(foe);

    world.vfx.add(
      {
        kind: 'bolt',
        from: { x: at.x + (Math.random() - 0.5) * 80, y: -30 },
        to: at,
        seed: Math.random() * 99,
      },
      '#fff6c8',
      0.22,
    );
    world.fx.ring(at.x, at.y, 24, '255,240,190', 0.05);
    this.#skills.push(at.x, foe.ground, 45, 600);
    hitMark(world, foe, 1, false, true);
    world.juice.kick(3);
    this.#numbers.add(world, foe, event.amount, TEXT.strike);
  }

  #heal(event: EventOf<typeof BattleEventType.Heal>): void {
    const world = this.#world;
    const target = world.cast.hero(event.hero ?? event.source);

    if (!target) return;
    const at = top(target);

    mend(world.fx, at.x, at.y, heroDefById(world.content, event.source).tint);
    this.#numbers.add(world, target, `+${compactNumber(event.amount)}`, TEXT.heal);
  }

  #partyHit(event: EventOf<typeof BattleEventType.PartyHit>): void {
    const world = this.#world;
    const hero = world.cast.hero(event.hero);
    const foe = world.cast.foe(event.foe);
    const rules = world.ruleFoe(event.foe);

    if (!hero) return;
    const dir = away(foe, hero, -1);
    const show = () => {
      hitMark(world, hero, dir, false, rules?.boss ?? false);
      this.#numbers.add(world, hero, event.amount, TEXT.wound);
      if (event.blocked) {
        const at = top(hero);

        world.fx.ring(at.x, at.y, 18, '150,210,255', 0.1);
        this.#numbers.add(world, hero, t('arena.block'), TEXT.block);
      }
    };

    if (rules?.boss && foe) {
      show();
      bossBlow(world, foe, hero, rules.attack, dir);

      return;
    }
    const missile = foe?.state === 'stand' ? missileOf(foe.look) : null;

    if (foe && missile) world.shots.fire(missile, hand(foe), top(hero), world.accent, show);
    else show();
  }
}

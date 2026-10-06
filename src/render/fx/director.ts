import { heroDefById, type Content } from '@content';
import { BattleEventType, type BattleEvent } from '@engine';
import { t } from '@i18n';
import { compactNumber } from '../format';
import type { Actor } from '../scene/cast';
import { ARENA, center, floorTop, type Point } from '../scene/geometry';
import { MotionCue } from '../scene/motion';
import { bossAttack } from './boss-attacks';
import { Sparks } from './bursts';
import { FX_COLOR } from './colors';
import { FloatingText, type TextStyle } from './floating-text';
import { NumberTrail } from './number-trail';
import { NONE, type EventOf, type Reaction, type Stage } from './reaction';
import { LightPillar, ScreenFlash } from './screen';
import { heroAttack } from './hero-attacks';
import { Beam, CrossSlash } from './strikes';
import { TEXT } from './text-styles';

const BANNER_AT: Point = { x: ARENA.width / 2, y: ARENA.height * 0.35 };

const above = (actor: Actor, lift = 4): Point => ({
  x: center(actor.box).x,
  y: actor.box.y - lift,
});

function unhandled(event: never): never {
  throw new Error(`No reaction for ${JSON.stringify(event)}`);
}

export class Director {
  readonly #content: Content;
  readonly #trail = new NumberTrail();

  constructor(content: Content) {
    this.#content = content;
  }

  react(event: BattleEvent, stage: Stage): Reaction {
    switch (event.type) {
      case BattleEventType.Hit:
        return this.#hit(event, stage);
      case BattleEventType.Strike:
        return this.#strike(event, stage);
      case BattleEventType.Ultimate:
        return this.#ultimate(event, stage);
      case BattleEventType.Heal:
        return this.#heal(event, stage);
      case BattleEventType.PartyHit:
        return this.#partyHit(event, stage);
      case BattleEventType.FoeDefeated:
        return this.#defeated(event, stage);
      case BattleEventType.StageStarted:
      case BattleEventType.Respawned:
        for (const foe of stage.foes) foe.motion.cue(MotionCue.Entering);

        return NONE;
      case BattleEventType.StageCleared:
      case BattleEventType.Wiped:
        return NONE;
      default:
        return unhandled(event);
    }
  }

  celebrate(hero: Actor, level: number): Reaction {
    hero.motion.cue(MotionCue.Glow);

    return {
      effects: [
        new LightPillar(center(hero.box).x, floorTop() + 18),
        new FloatingText(
          level === 1 ? t('arena.joined') : t('arena.levelUp', { level }),
          above(hero, 6),
          TEXT.levelUp,
        ),
      ],
      shake: 0,
    };
  }

  #hit(event: EventOf<typeof BattleEventType.Hit>, stage: Stage): Reaction {
    const foe = stage.foes[event.foe];
    const hero = stage.heroes.find((actor) => actor.id === event.source);

    if (!foe || !hero) return NONE;
    foe.motion.cue(MotionCue.Flash);
    const style = heroDefById(this.#content, hero.id).attack;

    return {
      effects: [
        ...heroAttack(style, hero, foe, stage.element.accent),
        new Sparks(center(foe.box), [FX_COLOR.steel, stage.element.accent], {
          count: 8,
          reach: 18,
        }),
        this.#number(compactNumber(event.amount), above(foe), event.crit ? TEXT.crit : TEXT.hit),
      ],
      shake: event.crit ? 2 : 0,
    };
  }

  #strike(event: EventOf<typeof BattleEventType.Strike>, stage: Stage): Reaction {
    const foe = stage.foes[event.foe];

    if (!foe) return NONE;
    foe.motion.cue(MotionCue.Flash);
    const at = center(foe.box);

    return {
      effects: [
        new CrossSlash(at, FX_COLOR.player),
        new Sparks(at, [FX_COLOR.player, FX_COLOR.steel], { count: 8, reach: 18 }),
        this.#number(compactNumber(event.amount), above(foe, 10), TEXT.strike),
      ],
      shake: 3,
    };
  }

  #ultimate(event: EventOf<typeof BattleEventType.Ultimate>, stage: Stage): Reaction {
    const foe = stage.foes[event.foe];
    const front = stage.heroes.at(-1);

    if (!foe || !front) return NONE;
    foe.motion.cue(MotionCue.Flash);
    const at = center(foe.box);

    return {
      effects: [
        new Beam(center(front.box), at),
        new ScreenFlash(FX_COLOR.holy, 0.9),
        new Sparks(at, [FX_COLOR.holy, FX_COLOR.gold], { count: 16, reach: 40 }),
        this.#number(compactNumber(event.amount), above(foe, 14), TEXT.ultimate),
      ],
      shake: 4,
    };
  }

  #heal(event: EventOf<typeof BattleEventType.Heal>, stage: Stage): Reaction {
    const healer = stage.heroes.find((actor) => actor.id === event.source);

    if (!healer) return NONE;
    const text = this.#number(`+${compactNumber(event.amount)}`, above(healer), TEXT.heal);

    return { effects: [text], shake: 0 };
  }

  #partyHit(event: EventOf<typeof BattleEventType.PartyHit>, stage: Stage): Reaction {
    const attacker = stage.foes[event.foe];
    const accent = stage.element.accent;
    const signature = attacker?.attack
      ? bossAttack(attacker.attack, attacker, stage.heroes, accent)
      : { effects: [], shake: 1 };

    if (!attacker?.attack) attacker?.motion.cue(MotionCue.Hop);
    for (const hero of stage.heroes) hero.motion.cue(MotionCue.Hurt);
    const target = stage.heroes[0];
    const wound = target
      ? [this.#number(`-${compactNumber(event.amount)}`, above(target), TEXT.wound)]
      : [];

    return {
      effects: [...signature.effects, ...wound, new ScreenFlash(accent, 0.25, 0.4)],
      shake: signature.shake,
    };
  }

  #defeated(event: EventOf<typeof BattleEventType.FoeDefeated>, stage: Stage): Reaction {
    const foe = stage.foes[event.foe];

    if (!foe) return NONE;
    foe.motion.cue(MotionCue.Dying);
    const accent = stage.element.accent;

    if (!event.boss) {
      return {
        effects: [new Sparks(center(foe.box), [accent], { count: 6, reach: 14 })],
        shake: 0,
      };
    }
    const banner = { color: accent, size: 24, life: 1.4, rise: 8 };

    return {
      effects: [
        new Sparks(center(foe.box), [accent, FX_COLOR.steel], { count: 24, reach: 60 }),
        new FloatingText(t('arena.defeated'), BANNER_AT, banner),
      ],
      shake: 4,
    };
  }

  #number(text: string, at: Point, style: TextStyle): FloatingText {
    return new FloatingText(text, this.#trail.place(at), style);
  }
}

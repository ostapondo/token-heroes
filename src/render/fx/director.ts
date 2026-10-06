import { heroDefById, type Content, type ElementDef } from '@content';
import { AttackStyle, BattleEventType, type BattleEvent } from '@engine';
import { compactNumber } from '../format';
import type { Actor } from '../scene/cast';
import { ARENA, center, floorTop, type Point } from '../scene/geometry';
import { MotionCue } from '../scene/motion';
import { Shockwave, Sparks } from './bursts';
import { FX_COLOR } from './colors';
import type { Effect } from './effect';
import { FloatingText, type TextStyle } from './floating-text';
import { LightPillar, ScreenFlash } from './screen';
import { Beam, CrossSlash, Projectile, Slash } from './strikes';

export const ARENA_LABEL = {
  defeated: 'DEFEATED',
  levelUp: (level: number) => `LV ${level}!`,
} as const;

const TEXT = {
  hit: { color: FX_COLOR.steel, size: 10 },
  crit: { color: FX_COLOR.crit, size: 14 },
  strike: { color: FX_COLOR.crit, size: 16 },
  ultimate: { color: FX_COLOR.holy, size: 18 },
  heal: { color: FX_COLOR.heal, size: 9 },
  wound: { color: FX_COLOR.wound, size: 11 },
  levelUp: { color: FX_COLOR.gold, size: 11, life: 1.3 },
} as const satisfies Record<string, TextStyle>;

const BANNER_AT: Point = { x: ARENA.width / 2, y: ARENA.height * 0.35 };

export interface Reaction {
  readonly effects: readonly Effect[];
  readonly shake: number;
}

export interface Stage {
  readonly heroes: readonly Actor[];
  readonly foes: readonly Actor[];
  readonly element: ElementDef;
}

type EventOf<T extends BattleEvent['type']> = Extract<BattleEvent, { type: T }>;

const NONE: Reaction = { effects: [], shake: 0 };

const above = (actor: Actor, lift = 4): Point => ({
  x: center(actor.box).x,
  y: actor.box.y - lift,
});

function unhandled(event: never): never {
  throw new Error(`No reaction for ${JSON.stringify(event)}`);
}

export class Director {
  readonly #content: Content;

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
        new FloatingText(ARENA_LABEL.levelUp(level), above(hero, 6), TEXT.levelUp),
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
        ...this.#attack(style, hero, foe, stage.element.accent),
        new Sparks(center(foe.box), [FX_COLOR.steel, stage.element.accent], {
          count: 8,
          reach: 18,
        }),
        new FloatingText(
          compactNumber(event.amount),
          above(foe),
          event.crit ? TEXT.crit : TEXT.hit,
        ),
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
        new CrossSlash(at),
        new Sparks(at, [FX_COLOR.crit, stage.element.accent], { count: 12, reach: 30 }),
        new FloatingText(compactNumber(event.amount), above(foe, 10), TEXT.strike),
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
        new FloatingText(compactNumber(event.amount), above(foe, 14), TEXT.ultimate),
      ],
      shake: 4,
    };
  }

  #heal(event: EventOf<typeof BattleEventType.Heal>, stage: Stage): Reaction {
    const healer = stage.heroes.find((actor) => actor.id === event.source);
    if (!healer) return NONE;
    const text = new FloatingText(`+${compactNumber(event.amount)}`, above(healer), TEXT.heal);
    return { effects: [text], shake: 0 };
  }

  #partyHit(event: EventOf<typeof BattleEventType.PartyHit>, stage: Stage): Reaction {
    stage.foes[event.foe]?.motion.cue(MotionCue.Lunge);
    for (const hero of stage.heroes) hero.motion.cue(MotionCue.Hurt);
    const target = stage.heroes[0];
    const wound = target
      ? [new FloatingText(`-${compactNumber(event.amount)}`, above(target), TEXT.wound)]
      : [];
    return { effects: [...wound, new ScreenFlash(stage.element.accent, 0.25, 0.4)], shake: 1 };
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
        new FloatingText(ARENA_LABEL.defeated, BANNER_AT, banner),
      ],
      shake: 4,
    };
  }

  #attack(style: AttackStyle, hero: Actor, foe: Actor, accent: string): Effect[] {
    const from = center(hero.box);
    const to = center(foe.box);
    switch (style) {
      case AttackStyle.Slash:
        hero.motion.cue(MotionCue.Dash);
        return [new Slash(to, accent)];
      case AttackStyle.Arrow:
        return [new Projectile(from, to, [FX_COLOR.wood, FX_COLOR.heal], 1)];
      case AttackStyle.Bash:
        return [new Shockwave(to, FX_COLOR.stone)];
      case AttackStyle.Spell:
        return [new Projectile(from, to, [FX_COLOR.gold, FX_COLOR.ember], 3)];
      case AttackStyle.Heal:
        return [];
      default:
        return unhandled(style);
    }
  }
}

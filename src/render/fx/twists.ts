import { BossMechanic, type BattleEventType } from '@engine';
import { t } from '@i18n';
import { compactNumber } from '../format';
import type { Actor } from '../scene/cast';
import { ARENA, center, type Point } from '../scene/geometry';
import { MotionCue } from '../scene/motion';
import { Sparks } from './bursts';
import { FX_COLOR } from './colors';
import { FloatingText, type TextStyle } from './floating-text';
import { NONE, type EventOf, type Reaction, type Stage } from './reaction';
import { ScreenFlash } from './screen';
import { TEXT } from './text-styles';

type Place = (text: string, at: Point, style: TextStyle) => FloatingText;
type TwistEvent = EventOf<typeof BattleEventType.Mechanic>;

const BANNER_AT: Point = { x: ARENA.width / 2, y: ARENA.height * 0.3 };
// Crits come often in a big party; the boss says so on one in this many.
const PRAISE_EVERY = 3;
const PERCENT = 100;

const above = (actor: Actor): Point => ({ x: center(actor.box).x, y: actor.box.y - 4 });

function unhandled(mechanic: never): never {
  throw new Error(`No reaction for the mechanic ${String(mechanic)}`);
}

// How the arena shows a super boss mechanic at work.
export class Twists {
  readonly #place: Place;
  #flattered = 0;

  constructor(place: Place) {
    this.#place = place;
  }

  react(event: TwistEvent, stage: Stage): Reaction {
    const foe = stage.foes[event.foe];

    if (!foe) return NONE;
    switch (event.mechanic) {
      case BossMechanic.Hallucinate:
        return {
          effects: [this.#place(t('arena.twist.hallucinate'), above(foe), TEXT.phantom)],
          shake: 0,
        };
      case BossMechanic.Inject:
        return {
          effects: [
            new Sparks(center(foe.box), [FX_COLOR.poison], { count: 6, reach: 12 }),
            this.#place(
              t('arena.twist.inject', { amount: compactNumber(event.amount) }),
              above(foe),
              TEXT.poison,
            ),
          ],
          shake: 0,
        };
      case BossMechanic.Flatter:
        this.#flattered += 1;

        return this.#flattered % PRAISE_EVERY === 1
          ? { effects: [this.#place(t('arena.twist.flatter'), above(foe), TEXT.praise)], shake: 0 }
          : NONE;
      case BossMechanic.Throttle:
        return banner(t('arena.twist.throttle'), t('arena.twist.throttleNote'), FX_COLOR.wound, 2);
      case BossMechanic.Loop:
        foe.motion.cue(MotionCue.Glow);

        return banner(t('arena.twist.loop'), `+${compactNumber(event.amount)}`, FX_COLOR.poison, 2);
      case BossMechanic.Unmask:
        foe.motion.cue(MotionCue.Hop);

        return banner(t('arena.twist.unmask'), '', FX_COLOR.wound, 5);
      case BossMechanic.StealContext: {
        const percent = Math.round(event.amount * PERCENT);

        return {
          effects: [this.#place(t('arena.twist.steal', { percent }), above(foe), TEXT.drain)],
          shake: 0,
        };
      }
      case BossMechanic.Maximize:
        return NONE;
      default:
        return unhandled(event.mechanic);
    }
  }
}

function banner(title: string, note: string, color: string, shake: number): Reaction {
  const below = { x: BANNER_AT.x, y: BANNER_AT.y + 18 };

  return {
    effects: [
      new ScreenFlash(color, 0.35, 0.5),
      new FloatingText(title, BANNER_AT, { ...TEXT.alarm, color }),
      ...(note ? [new FloatingText(note, below, TEXT.alarmNote)] : []),
    ],
    shake,
  };
}

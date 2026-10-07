import type { BattleEventType } from '@engine';
import { t } from '@i18n';
import { compactNumber } from '../format';
import type { Actor } from '../scene/cast';
import { center, type Point } from '../scene/geometry';
import { MotionCue } from '../scene/motion';
import { bossAttack } from './boss-attacks';
import type { FloatingText, TextStyle } from './floating-text';
import type { EventOf, Reaction, Stage } from './reaction';
import { ScreenFlash } from './screen';
import { TEXT } from './text-styles';

type PartyHitEvent = EventOf<typeof BattleEventType.PartyHit>;
type Place = (text: string, at: Point, style: TextStyle) => FloatingText;

const above = (actor: Actor, lift = 4): Point => ({
  x: center(actor.box).x,
  y: actor.box.y - lift,
});

// A foe's blow on the party: its attack, the wound it leaves and what a shield took of it.
export function partyHit(event: PartyHitEvent, stage: Stage, place: Place): Reaction {
  const attacker = stage.foes[event.foe];
  const accent = stage.element.accent;
  const signature = attacker?.attack
    ? bossAttack(attacker.attack, attacker, stage.heroes, accent)
    : { effects: [], shake: 1 };

  if (!attacker?.attack) attacker?.motion.cue(MotionCue.Hop);
  for (const hero of stage.heroes) hero.motion.cue(MotionCue.Hurt);
  const target = stage.heroes[0];
  const wound =
    target && event.amount > 0
      ? [place(`-${compactNumber(event.amount)}`, above(target), TEXT.wound)]
      : [];
  const blocked =
    target && event.blocked
      ? [
          place(
            `${t('arena.block')} ${compactNumber(event.blocked)}`,
            above(target, 14),
            TEXT.block,
          ),
        ]
      : [];

  return {
    effects: [...signature.effects, ...wound, ...blocked, new ScreenFlash(accent, 0.25, 0.4)],
    shake: signature.shake,
  };
}

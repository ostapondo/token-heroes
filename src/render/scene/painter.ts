import type { DeathKind } from '@content';
import { BALANCE, BattlePhase, type BattleState } from '@engine';
import { FX_COLOR } from '../fx/colors';
import { demiseMoment, paintDemise } from '../fx/demise';
import { SPRITE_OUTLINE, type SpriteCache } from '../sprites/sprite-cache';
import { PULLBACK } from './camera';
import type { Actor, Pullback } from './cast';

const TINT = { flash: FX_COLOR.steel, hurt: FX_COLOR.wound, glow: FX_COLOR.gold } as const;
const TINT_SHARE = 0.5;
const GLITCH = { alpha: 0.3, channels: [FX_COLOR.glitchRed, FX_COLOR.glitchCyan] } as const;
const HP_BAR = { height: 2, gap: 3, empty: '#000000' } as const;
const SHADOW = { color: 'rgba(0, 0, 0, 0.42)', spread: 0.55, depth: 2, bossDepth: 3 } as const;

const bottom = (actor: Actor): number => actor.box.y + actor.box.height;
const STANDING = { stage: 'standing' } as const;

// How the stage's element fells the party, and the clock that animates what is left of it.
export interface DeathStyle {
  readonly kind: DeathKind;
  readonly accent: string;
  readonly time: number;
}

// A death that streams away flows to the foe that dealt the blow.
function blowFrom(foes: readonly Actor[]): { x: number; y: number } {
  const foe = foes[0];

  return foe
    ? { x: foe.box.x + foe.box.width * 0.6, y: foe.box.y + foe.box.height * 0.3 }
    : { x: 160, y: 80 };
}

function tintOf(actor: Actor): string | null {
  if (actor.motion.flashing && !actor.glitches) return TINT.flash;
  if (actor.motion.hurting) return TINT.hurt;
  if (actor.motion.glowing) return TINT.glow;

  return null;
}

// A flat pixel ellipse under the feet. It follows a dash but stays on the ground through a hop.
function paintShadow(context: CanvasRenderingContext2D, actor: Actor, facing: 1 | -1): void {
  const feet = actor.box.y + actor.box.height + SPRITE_OUTLINE * actor.pixel - 1;
  const middle = actor.box.x + actor.box.width / 2 + actor.motion.offset(facing).x;
  const rx = Math.round(actor.box.width * SHADOW.spread);
  const ry = actor.boss ? SHADOW.bossDepth : SHADOW.depth;

  context.fillStyle = SHADOW.color;
  context.beginPath();
  for (let dy = -ry; dy <= ry; dy += 1) {
    const half = Math.round(rx * Math.sqrt(1 - (dy / (ry + 0.6)) ** 2));

    context.rect(Math.round(middle - half), feet + dy, half * 2, 1);
  }
  context.fill();
}

function paintActor(
  context: CanvasRenderingContext2D,
  sprites: SpriteCache,
  actor: Actor,
  facing: 1 | -1,
): void {
  const tint = tintOf(actor);
  const bitmap = sprites.get(actor.key, actor.sprite, actor.palette);
  // A hit or a level-up washes the sprite in a colour, but only halfway, so it stays readable.
  const wash = tint ? sprites.ghost(actor.key, actor.sprite, tint, actor.palette) : null;
  const offset = actor.motion.offset(facing);
  const border = SPRITE_OUTLINE * actor.pixel;
  const x = actor.box.x - border;
  const y = actor.box.y - border;
  const width = actor.box.width + border * 2;
  const height = actor.box.height + border * 2;

  const alpha = actor.motion.fade;
  const draw = (image: HTMLCanvasElement, left: number, top: number) => {
    context.globalAlpha = alpha;
    context.drawImage(image, left, top, width, height);
    if (!wash) return;
    context.globalAlpha = alpha * TINT_SHARE;
    context.drawImage(wash, left, top, width, height);
  };

  context.save();
  draw(bitmap, x + offset.x, y + offset.y);
  if (actor.glitches && actor.motion.flashing) {
    // A red copy one sprite pixel to one side and a cyan one to the other, laid over the
    // sprite without an outline so they tint its edges like a torn signal.
    context.globalAlpha = GLITCH.alpha * actor.motion.fade;
    GLITCH.channels.forEach((color, side) => {
      const shift = (side === 0 ? -1 : 1) * actor.pixel;
      const channel = sprites.ghost(actor.key, actor.sprite, color, actor.palette);

      context.drawImage(channel, x + offset.x + shift, y + offset.y, width, height);
    });
  }
  context.restore();
}

export function paintCast(
  context: CanvasRenderingContext2D,
  sprites: SpriteCache,
  cast: { heroes: readonly Actor[]; foes: readonly Actor[] },
  battle: BattleState,
  death: DeathStyle,
): void {
  const wiped = battle.phase === BattlePhase.Wiped;
  const elapsed = BALANCE.respawnDelay - battle.phaseLeft;
  const frontFirst = cast.heroes.toSorted(
    (left, right) => right.box.x + right.box.width - (left.box.x + left.box.width),
  );
  const momentOf = (actor: Actor) =>
    wiped ? demiseMoment(elapsed, frontFirst.indexOf(actor)) : STANDING;
  const foes = cast.foes
    .map((actor, index) => ({ actor, foe: battle.foes[index] }))
    .toSorted((left, right) => bottom(left.actor) - bottom(right.actor));

  for (const { actor, foe } of foes) if (foe && foe.hp > 0) paintShadow(context, actor, -1);
  for (const actor of cast.heroes) {
    if (momentOf(actor).stage === 'standing') paintShadow(context, actor, 1);
  }
  foes.forEach(({ actor, foe }) => {
    const visible = foe && (foe.hp > 0 || actor.motion.fade < 1);

    if (visible) paintActor(context, sprites, actor, -1);
    if (foe && foe.hp > 0 && !foe.boss) paintHpBar(context, actor, foe.hp / foe.maxHp);
  });
  const scene = { target: blowFrom(cast.foes), accent: death.accent, time: death.time };
  // Heroes face the foes, so on a tie the one further from them is drawn on top: a neighbour
  // then covers the back of the hero in front, never its face.
  const farthestFirst = cast.heroes.toSorted(
    (left, right) => bottom(left) - bottom(right) || right.box.x - left.box.x,
  );

  for (const actor of farthestFirst) {
    const moment = momentOf(actor);

    if (moment.stage === 'standing') paintActor(context, sprites, actor, 1);
    else paintDemise(context, actor, death.kind, moment, scene);
  }
}

function paintHpBar(context: CanvasRenderingContext2D, actor: Actor, share: number): void {
  const { x, y, width } = actor.box;

  context.fillStyle = HP_BAR.empty;
  context.fillRect(x, y - HP_BAR.gap, width, HP_BAR.height);
  context.fillStyle = FX_COLOR.wound;
  context.fillRect(x, y - HP_BAR.gap, Math.ceil(width * share), HP_BAR.height);
}

// The scene as it stood shrinks toward the foes' corner while the camera pulls back.
export function paintPullback(
  context: CanvasRenderingContext2D,
  sprites: SpriteCache,
  pullback: Pullback,
  progress: number,
  battle: BattleState,
  death: DeathStyle,
): void {
  const eased = progress < 0.5 ? 2 * progress * progress : 1 - (2 - 2 * progress) ** 2 / 2;
  const scale = 1 + (pullback.ratio - 1) * eased;
  const { pivot } = PULLBACK;

  context.save();
  context.translate(pivot.x, pivot.y);
  context.scale(scale, scale);
  context.translate(-pivot.x, -pivot.y);
  paintCast(context, sprites, pullback, battle, death);
  context.restore();
}

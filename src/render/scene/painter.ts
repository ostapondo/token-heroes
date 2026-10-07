import { BattlePhase, type BattleState } from '@engine';
import { FX_COLOR } from '../fx/colors';
import { SPRITE_OUTLINE, type SpriteCache } from '../sprites/sprite-cache';
import { PULLBACK } from './camera';
import type { Actor, Pullback } from './cast';

const TINT = { flash: FX_COLOR.steel, hurt: FX_COLOR.wound, glow: FX_COLOR.gold } as const;
const FALLEN_ALPHA = 0.45;
const HP_BAR = { height: 2, gap: 3, empty: '#000000' } as const;
const SHADOW = { color: 'rgba(0, 0, 0, 0.42)', spread: 0.55, depth: 2, bossDepth: 3 } as const;

const bottom = (actor: Actor): number => actor.box.y + actor.box.height;

function tintOf(actor: Actor): string | null {
  if (actor.motion.flashing) return TINT.flash;
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
  for (let dy = -ry; dy <= ry; dy += 1) {
    const half = Math.round(rx * Math.sqrt(1 - (dy / (ry + 0.6)) ** 2));

    context.fillRect(Math.round(middle - half), feet + dy, half * 2, 1);
  }
}

function paintActor(
  context: CanvasRenderingContext2D,
  sprites: SpriteCache,
  actor: Actor,
  facing: 1 | -1,
  fallen: boolean,
): void {
  const tint = tintOf(actor);
  const bitmap = tint
    ? sprites.silhouette(actor.key, actor.sprite, tint, actor.palette)
    : sprites.get(actor.key, actor.sprite, actor.palette);
  const offset = actor.motion.offset(facing);
  const border = SPRITE_OUTLINE * actor.pixel;
  const x = actor.box.x - border;
  const y = actor.box.y - border;
  const width = actor.box.width + border * 2;
  const height = actor.box.height + border * 2;

  context.save();
  context.globalAlpha = fallen ? FALLEN_ALPHA : actor.motion.fade;
  if (fallen) {
    context.translate(x + width / 2, y + height);
    context.rotate(-Math.PI / 2);
    context.drawImage(bitmap, 0, -height / 2, width, height);
  } else {
    context.drawImage(bitmap, x + offset.x, y + offset.y, width, height);
  }
  context.restore();
}

export function paintCast(
  context: CanvasRenderingContext2D,
  sprites: SpriteCache,
  cast: { heroes: readonly Actor[]; foes: readonly Actor[] },
  battle: BattleState,
): void {
  const foes = cast.foes
    .map((actor, index) => ({ actor, foe: battle.foes[index] }))
    .toSorted((left, right) => bottom(left.actor) - bottom(right.actor));

  for (const { actor, foe } of foes) if (foe && foe.hp > 0) paintShadow(context, actor, -1);
  for (const actor of cast.heroes) paintShadow(context, actor, 1);
  foes.forEach(({ actor, foe }) => {
    const visible = foe && (foe.hp > 0 || actor.motion.fade < 1);

    if (visible) paintActor(context, sprites, actor, -1, false);
    if (foe && foe.hp > 0 && !foe.boss) paintHpBar(context, actor, foe.hp / foe.maxHp);
  });
  const fallen = battle.phase === BattlePhase.Wiped;
  // Heroes face the foes, so on a tie the one further from them is drawn on top: a neighbour
  // then covers the back of the hero in front, never its face.
  const farthestFirst = cast.heroes.toSorted(
    (left, right) => bottom(left) - bottom(right) || right.box.x - left.box.x,
  );

  for (const actor of farthestFirst) paintActor(context, sprites, actor, 1, fallen);
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
): void {
  const eased = progress < 0.5 ? 2 * progress * progress : 1 - (2 - 2 * progress) ** 2 / 2;
  const scale = 1 + (pullback.ratio - 1) * eased;
  const { pivot } = PULLBACK;

  context.save();
  context.translate(pivot.x, pivot.y);
  context.scale(scale, scale);
  context.translate(-pivot.x, -pivot.y);
  paintCast(context, sprites, pullback, battle);
  context.restore();
}

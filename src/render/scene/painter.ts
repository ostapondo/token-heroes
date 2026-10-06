import type { ElementDef } from '@content';
import { BattlePhase, type BattleState } from '@engine';
import { FX_COLOR } from '../fx/colors';
import { SPRITE_OUTLINE, type SpriteCache } from '../sprites/sprite-cache';
import type { Actor } from './cast';
import { ARENA, floorTop } from './geometry';

const TINT = { flash: FX_COLOR.steel, hurt: FX_COLOR.wound, glow: FX_COLOR.gold } as const;
const FALLEN_ALPHA = 0.45;
const HP_BAR = { height: 2, gap: 3, empty: '#000000' } as const;

export function paintBackdrop(context: CanvasRenderingContext2D, element: ElementDef): void {
  context.fillStyle = element.sky;
  context.fillRect(0, 0, ARENA.width, ARENA.height);
  context.fillStyle = element.floor;
  context.fillRect(0, floorTop(), ARENA.width, ARENA.floorHeight);
  context.fillStyle = FX_COLOR.shadow;
  context.fillRect(0, floorTop(), ARENA.width, 1);
}

const bottom = (actor: Actor): number => actor.box.y + actor.box.height;

function tintOf(actor: Actor): string | null {
  if (actor.motion.flashing) return TINT.flash;
  if (actor.motion.hurting) return TINT.hurt;
  if (actor.motion.glowing) return TINT.glow;

  return null;
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

  foes.forEach(({ actor, foe }) => {
    const visible = foe && (foe.hp > 0 || actor.motion.fade < 1);

    if (visible) paintActor(context, sprites, actor, -1, false);
    if (foe && foe.hp > 0 && !foe.boss) paintHpBar(context, actor, foe.hp / foe.maxHp);
  });
  const fallen = battle.phase === BattlePhase.Wiped;
  const farthestFirst = cast.heroes.toSorted((left, right) => bottom(left) - bottom(right));

  for (const actor of farthestFirst) paintActor(context, sprites, actor, 1, fallen);
}

function paintHpBar(context: CanvasRenderingContext2D, actor: Actor, share: number): void {
  const { x, y, width } = actor.box;

  context.fillStyle = HP_BAR.empty;
  context.fillRect(x, y - HP_BAR.gap, width, HP_BAR.height);
  context.fillStyle = FX_COLOR.wound;
  context.fillRect(x, y - HP_BAR.gap, Math.ceil(width * share), HP_BAR.height);
}

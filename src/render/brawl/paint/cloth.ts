import type { BipedLook, Build, Cloth } from '@content';
import type { Point } from '../../geometry';
import { J } from '../rig/skeleton';
import { darken } from './colors';
import type { Kit } from './kit';

export const CLOTH_LINKS = 5;

const caped = new WeakMap<BipedLook, readonly Cloth[]>();

// The cloth a body wears; a hero born without a cape gains one at Steel gear, in its own colour.
export function clothOf(look: BipedLook, tier: number, tint: string | undefined): readonly Cloth[] {
  const own = look.cloth ?? [];

  if (!tint || tier < 2 || own.some((cloth) => cloth.at === 'back')) return own;
  let list = caped.get(look);

  if (!list) {
    const cape: Cloth = {
      at: 'back',
      length: 15,
      width: 6,
      color: [darken(tint, 0.62), darken(tint, 0.34)],
    };

    list = [cape, ...own];
    caped.set(look, list);
  }

  return list;
}

// Where a piece of cloth is pinned: behind the neck, the back of the head, the waist or the back.
export function clothAnchor(
  cloth: Cloth,
  build: Build,
  points: readonly Point[],
  facing: number,
): Point {
  const s = build.scale;
  const neck = points[J.neck] ?? { x: 0, y: 0 };
  const pelvis = points[J.pelvis] ?? neck;
  const head = points[J.head] ?? neck;
  const back = -facing;

  if (cloth.at === 'neck') return { x: neck.x + back * 2 * s, y: neck.y + s };
  if (cloth.at === 'head') {
    return { x: head.x + back * build.head * s * 0.7, y: head.y - build.head * s * 0.2 };
  }
  if (cloth.at === 'waist')
    return { x: pelvis.x + back * build.hips * s * 0.9, y: pelvis.y - 2 * s };

  return {
    x: neck.x + (pelvis.x - neck.x) * 0.08 + back * build.shoulders * s * 0.7,
    y: neck.y + (pelvis.y - neck.y) * 0.08,
  };
}

// A chain of links that hangs straight back, for a body the physics has not moved yet.
export function hanging(cloth: Cloth, anchor: Point, scale: number, facing: number): Point[] {
  const link = (cloth.length * scale) / (CLOTH_LINKS - 1);

  return Array.from({ length: CLOTH_LINKS }, (_, i) => ({
    x: anchor.x - facing * i * link * 0.35,
    y: anchor.y + i * link * 0.92,
  }));
}

// A ribbon along the chain that narrows toward its free end, ragged for fur and tattered robes.
export function paintCloth(kit: Kit, cloth: Cloth, chain: readonly Point[], scale: number): void {
  const { p } = kit;
  const n = chain.length;
  const w0 = cloth.width * scale;
  const w1 = w0 * (cloth.taper ?? 0.75);
  const left: number[] = [];
  const right: number[] = [];

  chain.forEach((point, i) => {
    const a = chain[Math.max(0, i - 1)] ?? point;
    const b = chain[Math.min(n - 1, i + 1)] ?? point;
    let nx = -(b.y - a.y);
    let ny = b.x - a.x;
    const length = Math.hypot(nx, ny) || 1;
    const half = (w0 + (w1 - w0) * (i / Math.max(1, n - 1))) / 2;

    nx /= length;
    ny /= length;
    left.push(point.x + nx * half, point.y + ny * half);
    right.unshift(point.x - nx * half, point.y - ny * half);
  });
  if (cloth.ragged) {
    const end = chain[n - 1];

    if (end) right.unshift(end.x + 2 * scale, end.y + 2 * scale, end.x - scale, end.y - scale);
  }
  p.worldLight();
  p.cel(p.polygon(...left, ...right), kit.shade(cloth.color), w0);
}

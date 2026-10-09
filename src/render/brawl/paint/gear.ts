import type { Offhand, Paint, Weapon } from '@content';
import { batWing, mirror, paperclip, stopSign } from './boss-gear';
import type { Kit } from './kit';
import { OUTLINE } from './painter';

const GOLD = ['#f2c14e', '#9a6a14'] as const;
const HAFT = '#6b4a2a';
const GRIP = '#4a3020';

// How far a bow is drawn and a staff charged, for the weapon to show.
export interface Grip {
  readonly pull: number;
  readonly charge: number;
}

function sword(kit: Kit, s: number, length: number, paint: Paint): void {
  const { p } = kit;

  p.stroke('-4,0 3,0', s, 1.7 * s, GRIP);
  p.cel(p.circle(-5 * s, 0, 1.5 * s), GOLD, 1.5 * s);
  p.cel(p.shape('2.4,-4.2 4.2,-4.2 4.2,4.2 2.4,4.2', s), GOLD, 2 * s);
  const tip = length - 4;

  p.cel(
    p.polygon(
      4.2 * s,
      -1.5 * s,
      tip * s,
      -1.5 * s,
      length * s,
      0,
      tip * s,
      1.5 * s,
      4.2 * s,
      1.5 * s,
    ),
    kit.shade(paint),
    1.5 * s,
  );
}

function bow(kit: Kit, s: number, wood: string, pull: number, crossbow: boolean): void {
  const { p } = kit;
  const { ctx } = p;
  const span = (crossbow ? 10 : 13) * s;
  const base = (crossbow ? 9 : -5) * s;
  const nock = crossbow ? (9 - pull * 7) * s : -5 * s - pull * 15 * s;

  if (crossbow) p.stroke('0,-4 0,14', s, 2.2 * s, wood);
  ctx.beginPath();
  ctx.moveTo(-span, base);
  ctx.quadraticCurveTo(0, base + (crossbow ? 6 : 12) * s, span, base);
  ctx.lineCap = 'round';
  ctx.lineWidth = 2.4 * s + p.outline;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.lineWidth = 2.4 * s;
  ctx.strokeStyle = crossbow ? '#8d95a3' : wood;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-span, base);
  ctx.lineTo(0, nock);
  ctx.lineTo(span, base);
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = '#efe6d4';
  ctx.stroke();
  if (crossbow || pull <= 0.05) return;
  p.segment(0, nock, 0, nock + 21 * s, 0.9 * s, wood);
  p.polyline(0.8 * s, '#e8e2d0', -1.4 * s, nock + s, 0, nock + 3 * s, 1.4 * s, nock + s);
}

function staff(kit: Kit, s: number, weapon: Extract<Weapon, { kind: 'staff' }>, charge: number) {
  const { p } = kit;
  const flicker = 0.85 + 0.15 * Math.sin(kit.t * 13) + charge * 0.9;

  p.stroke('-13,0 21,0', s, 1.9 * s, kit.lit(weapon.wood));
  p.stroke('20,0 24,-3', s, 1.2 * s, '#3a2414');
  p.stroke('20,0 24,3', s, 1.2 * s, '#3a2414');
  p.glow(25 * s, 0, 13 * s * flicker, kit.lit(weapon.glow), 0.85);
  p.cel(p.circle(25 * s, 0, (3.1 + charge * 1.6) * s), kit.shade(weapon.orb), 3 * s);
}

// A weapon in the fist: it lies across the forearm, along local +x.
export function paintWeapon(kit: Kit, weapon: Weapon, s: number, grip: Grip): void {
  const { p } = kit;

  switch (weapon.kind) {
    case 'sword':
      sword(kit, s, weapon.length, weapon.blade);
      break;
    case 'axe':
      p.stroke('-6,0 21,0', s, 1.9 * s, HAFT);
      p.cel(
        p.shape('14,-1.5 21,-1.5 25.5,4,20.5,10 16,7,14,1.5', s),
        kit.shade(weapon.blade),
        4 * s,
      );
      break;
    case 'cleaver':
      p.stroke('-6,0 21,0', s, 1.9 * s, HAFT);
      p.cel(p.shape('5,-1.5 20,-1.5 21,8 6,8', s), kit.shade(weapon.blade), 4 * s);
      break;
    case 'dagger':
      p.stroke('-3,0 3,0', s, 1.6 * s, GRIP);
      p.cel(p.shape('3,-1.3 12,-0.6 15,0 12,0.6 3,1.3', s), kit.shade(weapon.color), 1.3 * s);
      break;
    case 'mace':
      p.stroke('-4,0 16,0', s, 1.8 * s, '#5a3a22');
      p.cel(p.circle(18 * s, 0, 4 * s), kit.shade(weapon.color), 4 * s);
      break;
    case 'trident':
      p.stroke('-6,0 16,0', s, 1.4 * s, kit.lit(weapon.color));
      for (const y of ['-3', '0', '3']) p.stroke(`15,${y} 19,${y}`, s, 1 * s, '#e8e2d0');
      break;
    case 'staff':
      staff(kit, s, weapon, grip.charge);
      break;
    case 'paperclip':
      paperclip(kit, s, weapon.color);
      break;
    case 'stop':
      p.stroke('-6,0 28,0', s, 1.8 * s, '#8d95a3');
      p.ctx.save();
      p.ctx.translate(36 * s, 0);
      stopSign(kit, s, weapon.color);
      p.ctx.restore();
      break;
    case 'bow':
    case 'crossbow':
      bow(kit, s, kit.lit(weapon.wood), grip.pull, weapon.kind === 'crossbow');
      break;
  }
}

// What the far hand holds: a shield faces out past the fist.
export function paintOffhand(kit: Kit, offhand: Offhand, s: number): void {
  const { p } = kit;

  switch (offhand.kind) {
    case 'kite': {
      const mark = kit.lit(offhand.emblem);

      p.cel(p.shape('10,-4 10,10 3,11,-12,3 3,-5,10,-4', s), kit.shade(offhand.color), 6 * s);
      p.stroke('7,3 -6,3', s, 1.6 * s, mark);
      p.stroke('3,-1 3,7', s, 1.6 * s, mark);
      break;
    }
    case 'tower':
      p.cel(p.shape('13,-6 13,12 -15,12 -15,-6', s), kit.shade(offhand.rim), 8 * s);
      p.cel(p.shape('10,-3 10,9 -12,9 -12,-3', s), kit.shade(offhand.face), 6 * s);
      p.cel(p.circle(-1 * s, 3 * s, 2.6 * s), kit.shade(offhand.boss), 2.6 * s);
      break;
    case 'dagger':
      p.stroke('-3,0 3,0', s, 1.6 * s, GRIP);
      p.cel(p.shape('3,-1.3 12,-0.6 15,0 12,0.6 3,1.3', s), kit.shade(offhand.color), 1.3 * s);
      break;
    case 'mirror':
      mirror(kit, s, offhand.frame, offhand.glass);
      break;
  }
}

// Drawn in the torso's frame before the torso: a quiver on the back or a pair of wings.
export function paintBack(
  kit: Kit,
  s: number,
  shoulders: number,
  length: number,
  quiver?: Paint,
  wings?: Paint,
): void {
  const { p } = kit;
  const w = shoulders;

  if (quiver) {
    p.segment(-w * 1.2, -3 * s, -w * 1.6, -9 * s, 1.1 * s, '#e8e2d0');
    p.segment(-w * 0.8, -3 * s, -w, -10 * s, 1.1 * s, '#d8432e');
    p.cel(
      p.polygon(
        -w * 1.45,
        -4 * s,
        -w * 0.55,
        -5 * s,
        -w * 0.1,
        length * 0.7,
        -w * 0.95,
        length * 0.76,
      ),
      kit.shade(quiver),
      w * 0.5,
    );
  }
  if (wings) batWing(kit, s, wings, length);
}

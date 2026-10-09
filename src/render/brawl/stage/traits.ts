import type { Look, Stance } from '@content';
import { LANDS, Move } from '../rig/poses';
import { litOf } from '../paint/colors';
import type { Body } from './body';

const SWING: Readonly<Record<Stance, Move>> = {
  guard: Move.Sword,
  blade: Move.Sword,
  archer: Move.Bow,
  caster: Move.Staff,
  brawler: Move.Stab,
  stalker: Move.Stab,
  shambler: Move.Stab,
  brute: Move.Slam,
};

// A beast's strike snaps forward at this share of its swing, whatever the move is called.
const BEAST_LANDS = 0.55;

export const swingOf = (look: Look): Move =>
  look.rig === 'biped' ? SWING[look.stance] : Move.Stab;

export const landsAt = (look: Look, move: Move): number =>
  look.rig === 'beast' ? BEAST_LANDS : LANDS[move];

export type Missile = 'arrow' | 'bolt';

// A body that fights from range sends this across the floor instead of walking up to swing.
export function missileOf(look: Look): Missile | null {
  if (look.rig === 'beast') return look.form === 'eye' ? 'bolt' : null;
  const kind = look.weapon?.kind;

  if (kind === 'bow' || kind === 'crossbow') return 'arrow';

  return kind === 'staff' ? 'bolt' : null;
}

// What a blow knocks off a body: chips of its main colour, and sparks when it wears metal.
export function chipOf(body: Body): string {
  const { look, palette } = body;

  return litOf(look.rig === 'biped' ? look.colors.torso : 'a', palette);
}

export const metalOf = (look: Look): boolean => look.rig === 'biped' && look.metal === true;

// How far in front of itself a melee body lands its blow, in world units at scale 1.
export function reachOf(look: Look): number {
  if (look.rig === 'beast') return 22;
  const weapon = look.weapon;

  if (!weapon) return 18;

  return weapon.kind === 'sword' ? 18 + weapon.length * 0.6 : 28;
}

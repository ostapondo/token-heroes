import type { BipedLook, Build } from '@content';
import type { Point } from '../../geometry';
import { J } from '../rig/skeleton';
import { bands, inHand, pointAt as at, robe } from './biped-parts';
import { clothAnchor, clothOf, hanging, paintCloth } from './cloth';
import { farOf, type Shade } from './colors';
import { paintDetail } from './details';
import { hand, tail } from './boss-limbs';
import { paintBack, paintOffhand, paintWeapon, type Grip } from './gear';
import { paintHead } from './heads';
import type { Kit } from './kit';
import type { Mood } from './painter';
import { paintTier } from './tiers';

// Everything a two-legged body needs to be drawn this frame.
export interface BipedView {
  readonly look: BipedLook;
  readonly build: Build;
  readonly points: readonly Point[];
  readonly facing: number;
  readonly tier: number;
  readonly tint: string | undefined;
  readonly disarmed: boolean;
  readonly cloth: readonly (readonly Point[])[] | null;
  readonly grip: Grip;
  readonly mood: Mood;
  readonly hero: boolean;
}

type Part = 'upper' | 'fore' | 'hand' | 'thigh' | 'shin' | 'boot' | 'torso';

// Draws a two-legged body far parts first: back cloth and gear, far arm and leg, near leg, robe,
// torso, head, then the near arm and what it holds.
export function paintBiped(kit: Kit, view: BipedView): void {
  const { p } = kit;
  const { look, build: b, points: P, facing: f } = view;
  const s = b.scale;
  const near = (part: Part): Shade => kit.shade(look.colors[part]);
  const far = (part: Part): Shade => farOf(near(part));
  const neck = at(P, J.neck);
  const pelvis = at(P, J.pelvis);
  const shoulder = {
    x: neck.x + (pelvis.x - neck.x) * 0.12,
    y: neck.y + (pelvis.y - neck.y) * 0.12,
  };
  const spine = Math.hypot(pelvis.x - neck.x, pelvis.y - neck.y);
  const glow = look.details?.some((detail) => detail.kind === 'cracks') ? kit.lit('e') : undefined;
  const band = bands(kit, s, view.hero);
  const arm: [number, number] = [b.arm * s, b.arm * s * 0.9];
  const fore: [number, number] = [b.forearm * s, b.forearm * s * 0.85];
  const thigh: [number, number] = [b.leg * s, b.leg * s * 0.85];
  const shin: [number, number] = [b.calf * s, b.calf * s * 0.8];
  const fist = b.forearm * s * (look.fist ?? 1.15);
  const wS = b.shoulders * s;
  const wH = b.hips * s;

  p.mood = view.mood;
  p.outline = 2 + s * 0.7;
  paintTier(kit, view, 'behind');
  if (look.tail) tail(kit, pelvis, s, f, look.tail);
  clothOf(look, view.tier, view.tint).forEach((cloth, index) => {
    const chain = view.cloth?.[index] ?? hanging(cloth, clothAnchor(cloth, b, P, f), s, f);

    paintCloth(kit, cloth, chain, s);
  });
  if (look.quiver || look.wings) {
    p.frame(neck, pelvis, f);
    paintBack(kit, s, wS, spine, look.quiver, look.wings);
    p.restore();
  }
  p.bone(shoulder, at(P, J.elbowB), arm, far('upper'), f, band.crack(glow, arm[0]));
  p.bone(
    at(P, J.elbowB),
    at(P, J.handB),
    fore,
    far('fore'),
    f,
    band.crack(glow, fore[0]) ?? band.cuff(far('fore'), fore[0]),
  );
  const offhand = look.offhand;

  if (offhand && !view.disarmed)
    inHand(p, at(P, J.elbowB), at(P, J.handB), f, () => paintOffhand(kit, offhand, s));
  hand(kit, look.hands, at(P, J.handB), fist, far('hand'), f);
  p.bone(pelvis, at(P, J.kneeB), thigh, far('thigh'), f, band.crack(glow, thigh[0]));
  p.bone(at(P, J.kneeB), at(P, J.footB), shin, far('shin'), f, band.boot(far('boot'), shin[1]));
  p.bone(pelvis, at(P, J.kneeF), thigh, near('thigh'), f, band.crack(glow, thigh[0]));
  p.bone(at(P, J.kneeF), at(P, J.footF), shin, near('shin'), f, band.boot(near('boot'), shin[1]));
  if (look.robe) robe(kit, P, kit.shade(look.robe), wH + 1);
  p.frame(neck, pelvis, f);
  p.cel(
    p.polygon(
      -wS + 2,
      -3 * s,
      wS - 2,
      -3 * s,
      wS,
      2 * s,
      wH,
      spine + s,
      -wH,
      spine + s,
      -wS,
      2 * s,
    ),
    near('torso'),
    wS,
  );
  for (const detail of look.details ?? [])
    paintDetail(kit, { length: spine, shoulders: wS, hips: wH, s }, detail);
  p.restore();
  p.frame(at(P, J.head), neck, f);
  paintHead(kit, look.head, b.head * s);
  paintTier(kit, view, 'head');
  p.restore();
  p.bone(shoulder, at(P, J.elbowF), arm, near('upper'), f, band.crack(glow, arm[0]));
  paintTier(kit, view, 'shoulder');
  p.bone(
    at(P, J.elbowF),
    at(P, J.handF),
    fore,
    near('fore'),
    f,
    band.crack(glow, fore[0]) ?? band.cuff(near('fore'), fore[0]),
  );
  const weapon = look.weapon;

  if (weapon && !view.disarmed) {
    inHand(p, at(P, J.elbowF), at(P, J.handF), f, () => {
      paintWeapon(kit, weapon, s, view.grip);
      paintTier(kit, view, 'weapon');
    });
  }
  hand(kit, look.hands, at(P, J.handF), fist, near('hand'), f);
}

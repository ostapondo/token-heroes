import type { Point } from '../../geometry';
import { farOf, type Shade } from '../paint/colors';
import type { Kit } from '../paint/kit';
import { pick, type BeastState } from './beast';
import { paintDragonHead } from './dragon-head';
import type { QuadShape } from './quad-forms';
import { edge, paintBelly, paintSpines, paintTube, tube, type Sample } from './tube';

// Thin at the head, swelling through the neck to the chest, full to the hips, then down the tail
// to a point. The body runs head, neck, chest, hip and two tail joints, a fifth of it each.
function girth(u: number): number {
  if (u < 0.2) return 0.4 + 1.2 * u;
  if (u < 0.4) return 0.64 + 1.8 * (u - 0.2);
  if (u < 0.6) return 1 + 0.08 * Math.sin(((u - 0.4) / 0.2) * Math.PI);

  return Math.max(0.07, 1 - 0.93 * ((u - 0.6) / 0.4) ** 0.85);
}

// A bat's wing from the shoulder: arm up and back to the wrist, four fingers fanned back, and the
// membrane sagging between them down to the hip.
function wing(
  kit: Kit,
  shoulder: Point,
  hip: Point,
  size: number,
  facing: number,
  beat: number,
  shade: Shade,
): void {
  const { p } = kit;
  const back = -facing;
  const lift = Math.sin(beat) * 0.22;
  const at = (x: number, y: number): Point => ({
    x: shoulder.x + back * x * size,
    y: shoulder.y - (y + lift * x) * size,
  });
  const elbow = at(0.25, 0.85);
  const wrist = at(0.95, 1.25);
  const tips = [at(1.9, 0.95), at(1.85, 0.35), at(1.55, -0.1), at(1.05, -0.32)];
  const sag = (a: Point, b: Point): Point => ({
    x: (a.x + b.x) / 2 - back * size * 0.12,
    y: (a.y + b.y) / 2 + size * 0.12,
  });
  const edgeLine: number[] = [shoulder.x, shoulder.y, elbow.x, elbow.y, wrist.x, wrist.y];
  let last = wrist;

  for (const tip of tips) {
    if (last !== wrist) edgeLine.push(sag(last, tip).x, sag(last, tip).y);
    edgeLine.push(tip.x, tip.y);
    last = tip;
  }
  edgeLine.push(sag(last, hip).x, sag(last, hip).y, hip.x, hip.y);
  p.worldLight();
  p.cel(p.polygon(...edgeLine), shade, size);
  const depth = p.ctx.createLinearGradient(wrist.x, wrist.y, hip.x, hip.y + size * 0.4);

  depth.addColorStop(0, 'rgba(255,220,180,0.18)');
  depth.addColorStop(1, 'rgba(0,0,0,0.3)');
  p.ctx.beginPath();
  p.polygon(...edgeLine)(0, 0);
  p.ctx.fillStyle = depth;
  p.ctx.fill();
  const arm = shade[0] === kit.shade('b')[0] ? kit.shade('a') : farOf(kit.shade('a'));

  for (const tip of tips) p.bone(wrist, tip, [size * 0.045, size * 0.018], arm, 1);
  p.bone(shoulder, elbow, [size * 0.09, size * 0.075], arm, 1);
  p.bone(elbow, wrist, [size * 0.075, size * 0.06], arm, 1);
  p.worldLight();
  p.cel(
    p.polygon(
      wrist.x,
      wrist.y,
      wrist.x - back * size * 0.08,
      wrist.y - size * 0.2,
      wrist.x + back * size * 0.1,
      wrist.y - size * 0.02,
    ),
    kit.shade('h'),
    size * 0.1,
  );
}

function claws(kit: Kit, paw: Point, size: number, facing: number): void {
  const { p } = kit;

  for (const dx of [-0.5, 0.15, 0.8]) {
    const x = paw.x + facing * dx * size;

    p.cel(
      p.polygon(
        x,
        paw.y - size * 0.35,
        x + facing * size * 0.75,
        paw.y + size * 0.05,
        x,
        paw.y + size * 0.25,
      ),
      kit.shade('h'),
      size * 0.4,
    );
  }
}

function leg(
  kit: Kit,
  hip: Point,
  knee: Point,
  paw: Point,
  width: number,
  thigh: number,
  facing: number,
  shade: Shade,
): void {
  const { p } = kit;
  const length = Math.hypot(paw.x - knee.x, paw.y - knee.y);
  // A predator's leg: the shin runs back to a raised ankle and the foot steps forward onto claws.
  const ankle = { x: paw.x - facing * length * 0.35, y: paw.y - length * 0.42 };

  p.bone(hip, knee, [thigh, width * 1.1], shade, facing);
  p.bone(knee, ankle, [width * 1.05, width * 0.75], shade, facing);
  p.bone(ankle, paw, [width * 0.75, width * 0.6], shade, facing);
  claws(kit, paw, width * 0.95, facing);
}

const back = (line: readonly Sample[], u: number): Point => {
  const sample = line[Math.round(u * (line.length - 1))];

  return sample ? edge(sample, -sample.belly, 0.75) : { x: 0, y: 0 };
};

export function paintDragon(kit: Kit, state: BeastState, P: readonly Point[], q: QuadShape): void {
  const { p } = kit;
  const s = state.scale;
  const f = state.facing;
  const bulk = q.bulk * s;
  const legWidth = q.legWidth * s;
  const body = kit.shade('a');
  const shadow = farOf(kit.shade('a'));
  const at = (index: number) => pick(P, index);
  const line = tube([at(0), at(1), at(2), at(3), at(4), at(5)], (u) => bulk * girth(u), {
    x: f * 0.4,
    y: 0.9,
  });
  const shoulder = back(line, 0.38);
  const hipBack = back(line, 0.6);
  const beat = kit.t * 2.4 + state.seed + state.strike * 2;

  wing(
    kit,
    { x: shoulder.x + f * bulk * 0.3, y: shoulder.y - bulk * 0.15 },
    hipBack,
    bulk * 1.9,
    f,
    beat + 0.5,
    farOf(kit.shade('b')),
  );
  leg(kit, at(2), at(8), at(9), legWidth * 0.9, bulk * 0.3, f, shadow);
  leg(kit, at(3), at(12), at(13), legWidth, bulk * 0.4, f, shadow);
  paintSpines(kit, line, [0.08, 0.95], 3, 0.7, kit.shade('b'));
  paintTube(kit, line, body, bulk);
  paintBelly(kit, line, 0.12, 0.72);
  leg(kit, at(3), at(10), at(11), legWidth * 1.1, bulk * 0.46, f, body);
  wing(kit, shoulder, hipBack, bulk * 2.6, f, beat, kit.shade('b'));
  const head = at(0);
  const neck = at(1);

  p.ctx.save();
  p.ctx.translate(head.x, head.y);
  p.ctx.scale(f, 1);
  p.ctx.rotate(Math.atan2(head.y - neck.y, (head.x - neck.x) * f) * 0.45);
  p.worldLight();
  paintDragonHead(kit, q.head * s, Math.max(0, state.strike) * 0.5);
  p.ctx.restore();
  leg(kit, at(2), at(6), at(7), legWidth, bulk * 0.34, f, body);
}

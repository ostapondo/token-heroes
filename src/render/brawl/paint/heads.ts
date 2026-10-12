import type { Head } from '@content';
import { eye, face } from './faces';
import { hat } from './hats';
import type { Kit } from './kit';

function helm(kit: Kit, head: Extract<Head, { form: 'helm' }>, r: number): void {
  const { p, shade } = kit;
  const metal = shade(head.metal);
  const visor = kit.lit(head.visor);
  const SHAPES = {
    bucket: '-1.05,0.5 -1.1,-1.15,0,-1.15 1.1,-1.15,1.05,0.5 1.05,0.95 -1.05,0.95',
    great: '-1.05,-1.1 1.1,-1.1 1.15,1 -1.05,1',
  };

  if (head.plume)
    p.cel(
      p.shape('-0.1,-0.9 -0.9,-2,-1.9,-0.9 -1.2,-0.85,-0.55,-0.35', r),
      shade(head.plume),
      r * 0.6,
    );
  if (head.shape === 'round') p.cel(p.circle(0, 0, r * 1.08), metal, r);
  else p.cel(p.shape(SHAPES[head.shape], r), metal, r);
  p.ctx.fillStyle = '#101218';
  p.ctx.fillRect(r * 0.15, -r * 0.24, r * 0.95, r * 0.26);
  if (p.mood !== 'dead') {
    p.glow(r * 0.68, -r * 0.11, r * 0.8, visor, 0.5);
    p.ctx.fillStyle = visor;
    p.ctx.fillRect(r * 0.55, -r * 0.18, r * 0.26, r * 0.13);
  }
  if (head.crest) p.segment(-r * 0.3, -r * 1.12, r * 0.6, -r * 1.12, 1.6, kit.lit(head.crest));
}

export function paintHead(kit: Kit, head: Head, r: number): void {
  const { p, shade } = kit;

  switch (head.form) {
    case 'face':
      face(kit, head, r);
      break;
    case 'helm':
      helm(kit, head, r);
      break;
    case 'cowl': {
      const cloth = shade(head.cloth);

      p.cel(
        p.shape('-0.4,-1.3 0.9,-1.4,1.25,-0.2 1.3,0.9,0.6,1.2 -1.2,1.3 -1.6,0,-0.4,-1.3', r),
        cloth,
        r,
      );
      p.cel(p.circle(r * 0.38, r * 0.1, r * 0.72), [cloth[1], '#050405'], r * 0.6);
      if (head.mask)
        p.cel(p.shape('0,-0.6 0.95,-0.55 0.9,0.7 0.1,0.75', r), shade(head.mask), r * 0.5);
      eye(kit, r * 0.62, -r * 0.05, r * 0.13, kit.lit(head.eyes));
      break;
    }
    case 'skull':
      p.cel(p.bar(-r * 0.1, r * 0.72, r * 0.72, r * 0.32), shade(head.color), r * 0.3);
      p.cel(p.circle(0, -r * 0.05, r), shade(head.color), r);
      p.dot(r * 0.42, -r * 0.05, r * 0.3, '#1b1410');
      eye(kit, r * 0.46, -r * 0.05, r * 0.12, kit.lit(head.eyes));
      if (head.hat) hat(kit, head.hat, r);
      break;
    case 'rock':
      p.cel(
        p.shape('-1.05,-0.6 -0.4,-1.15 0.75,-1.05 1.15,-0.3 0.95,0.75 -0.75,0.95', r),
        shade(head.color),
        r,
      );
      eye(kit, r * 0.65, -r * 0.12, r * 0.16, kit.lit(head.eyes));
      if (head.hat) hat(kit, head.hat, r);
      break;
  }
}

import type { Hat } from '@content';
import type { Kit } from './kit';

// A ram's horn curling back from the crown, round past the ear and forward again, ridged.
const RAM = [
  '-0.25,-0.75 -1.45,-1.55,-1.8,-0.35 -1.9,0.65,-0.85,0.78 -0.25,0.78,-0.42,0.22',
  '-0.6,-0.22,-1.02,-0.06 -1.25,0.05,-1.12,-0.52 -0.88,-1.02,-0.05,-0.42',
].join(' ');
const RIDGES = [
  [-0.75, -1.05, -0.55, -0.7],
  [-1.3, -0.95, -0.95, -0.62],
  [-1.6, -0.35, -1.18, -0.28],
  [-1.55, 0.3, -1.12, 0.15],
] as const;

export function hat(kit: Kit, worn: Hat, r: number): void {
  const { p, shade } = kit;

  switch (worn.kind) {
    case 'straw':
      p.cel(p.shape('-1.9,-0.35 1.9,-0.35 0.15,-1.8', r), shade(worn.color), r);
      p.segment(-r * 0.8, -r * 0.55, r * 0.8, -r * 0.55, 1.2, '#6b4a2e');
      break;
    case 'kettle':
      p.cel(p.ellipse(0, -r * 0.3, r * 1.6, r * 0.35), shade(worn.color), r * 0.4);
      p.cel(p.shape('-1,-0.35 -0.9,-1.3,0,-1.3 0.9,-1.3,1,-0.35', r), shade(worn.color), r);
      break;
    case 'circlet':
      p.segment(-r * 0.9, -r * 0.55, r * 0.95, -r * 0.45, 1.3, kit.lit(worn.color));
      p.cel(p.circle(r * 0.9, -r * 0.47, r * 0.16), shade(worn.color), r * 0.16);
      break;
    case 'antlers':
      p.polyline(
        1.6,
        kit.lit(worn.color),
        -r * 0.2,
        -r * 0.8,
        -r * 0.7,
        -r * 1.8,
        -r * 1.3,
        -r * 2.1,
      );
      p.segment(-r * 0.6, -r * 1.6, -r * 0.2, -r * 2.2, 1.4, kit.lit(worn.color));
      p.cel(
        p.shape('-1,-0.4 -0.9,-1.2,0.1,-1.1 0.9,-0.95,1,-0.45 0,-0.75,-1,-0.4', r),
        ['#5a7a3a', '#2e4a1c'],
        r * 0.6,
      );
      break;
    case 'horns':
      p.cel(p.shape('-0.3,-0.8 -0.2,-1.9 0.3,-0.9', r), shade(worn.color), r * 0.3);
      break;
    case 'ram':
      p.cel(p.shape(RAM, r), shade(worn.color), r * 0.6);
      for (const [x0, y0, x1, y1] of RIDGES)
        p.segment(x0 * r, y0 * r, x1 * r, y1 * r, Math.max(0.6, r * 0.06), shade(worn.color)[1]);
      break;
    case 'tophat':
      p.ctx.save();
      p.ctx.rotate(-0.15);
      p.cel(p.ellipse(0, -r * 0.62, r * 1.45, r * 0.24), shade(worn.color), r * 0.3);
      p.cel(p.shape('-0.85,-0.65 -0.95,-2.3 0.95,-2.3 0.85,-0.65', r), shade(worn.color), r);
      if (worn.band)
        p.cel(
          p.shape('-0.86,-0.95 0.86,-0.95 0.87,-1.25 -0.88,-1.25', r),
          shade(worn.band),
          r * 0.3,
        );
      p.ctx.restore();
      break;
    case 'horned':
      p.cel(p.shape('-1.08,-0.2 -1.1,-1.2,0,-1.2 1.1,-1.2,1.08,-0.2', r), shade(worn.metal), r);
      p.cel(p.shape('-0.1,-1 0.9,-1.5,0.6,-2.5 1.4,-1.7,0.5,-0.7', r), shade(worn.horn), r * 0.5);
      break;
    case 'wizard':
      p.cel(p.ellipse(0, -r * 0.45, r * 1.5, r * 0.3), shade(worn.color), r * 0.4);
      p.cel(
        p.shape('-1,-0.55 1,-0.55 0.2,-1.6,-0.6,-2.5 -1.3,-2.7,-1.7,-2.2 -1,-1.6,-1,-0.55', r),
        shade(worn.color),
        r,
      );
      if (worn.band) p.segment(-r * 0.95, -r * 0.75, r * 0.85, -r * 0.75, 1.4, kit.lit(worn.band));
      break;
    case 'witch':
      p.cel(p.ellipse(0, -r * 0.45, r * 1.45, r * 0.28), shade(worn.color), r * 0.4);
      p.cel(
        p.shape('-0.95,-0.5 0.95,-0.5 0.1,-1.5,-0.2,-2.7 -0.9,-1.4,-0.95,-0.5', r),
        shade(worn.color),
        r,
      );
      if (worn.band) p.segment(-r * 0.9, -r * 0.7, r * 0.85, -r * 0.7, 1.2, kit.lit(worn.band));
      break;
  }
}

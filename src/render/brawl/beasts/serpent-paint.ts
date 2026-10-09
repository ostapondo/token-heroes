import type { Point } from '../../geometry';
import type { Kit } from '../paint/kit';
import { pick, type BeastState } from './beast';
import { paintSnakeHead, rune } from './serpent-head';
import { paintBelly, paintScales, paintSpines, paintTube, tube, type Sample } from './tube';

const THICK = 8;

// Thin behind the head, full through the neck, then tapering to a point.
const girth = (u: number): number =>
  u < 0.12 ? 0.72 + 2.3 * u : Math.max(0.05, 1 - 0.95 * ((u - 0.12) / 0.88) ** 1.3);

function tail(kit: Kit, line: readonly Sample[]): void {
  const end = line.at(-1);
  const before = line.at(-4);

  if (!end || !before) return;
  const dx = end.x - before.x;
  const dy = end.y - before.y;
  const length = Math.hypot(dx, dy) || 1;
  const size = (line.at(-6)?.r ?? end.r) * 1.6;
  const ux = dx / length;
  const uy = dy / length;

  kit.p.cel(
    kit.p.polygon(
      end.x - uy * size * 0.35,
      end.y + ux * size * 0.35,
      end.x + ux * size * 1.6,
      end.y + uy * size * 1.6,
      end.x + uy * size * 0.35,
      end.y - ux * size * 0.35,
    ),
    kit.shade('h'),
    size,
  );
}

// A sea serpent: one smooth body rearing in an S, fins down its spine, pale plates down its
// belly, and runes that glow along it when the look has marks.
export function paintSerpent(kit: Kit, state: BeastState, P: readonly Point[]): void {
  const { p } = kit;
  const s = state.scale;
  const f = state.facing;
  const radius = THICK * s * 0.5;
  // The belly faces down where the body lies and forward where it rears.
  const line = tube(P, (u) => radius * girth(u), { x: f * 0.7, y: 0.7 });
  const top = pick(P, 0);
  const neck = pick(P, 1);
  const marks = state.look.marks;

  paintSpines(kit, line, [0.06, 0.82], 3, 0.75, kit.shade('b'));
  tail(kit, line);
  paintTube(kit, line, kit.shade('a'), radius);
  paintBelly(kit, line, 0.02, 0.85);
  paintScales(kit, line, 0.1, 0.88);
  if (marks) {
    for (let i = 6; i < line.length * 0.8; i += 7) {
      const each = line[i];
      const glow = 0.5 + 0.4 * Math.sin(kit.t * 3 + i);

      if (each) rune(kit, each.x, each.y, each.r * 0.42, kit.lit(marks), glow);
    }
  }
  p.ctx.save();
  p.ctx.translate(top.x, top.y);
  p.ctx.scale(f, 1);
  // A rearing neck stands nearly upright, but the head still looks ahead and down at its prey.
  p.ctx.rotate(Math.atan2(top.y - neck.y, (top.x - neck.x) * f) * 0.3 + 0.2);
  p.worldLight();
  paintSnakeHead(kit, radius * 1.15, Math.max(0, state.strike) * 0.6, kit.t);
  p.ctx.restore();
}

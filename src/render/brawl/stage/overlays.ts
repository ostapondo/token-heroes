import { heroDefById } from '@content';
import { heroMaxHp } from '@engine';
import type { Body } from './body';
import { PIXEL_FONT } from './fx-paint';
import { head, type World } from './world';

const FULL = Math.PI * 2;
// A hero's bar shows this long after a blow, and always over the selected hero.
const BAR_SECONDS = 4;
const LOW = 0.35;

export function paintShadows(ctx: CanvasRenderingContext2D, bodies: readonly Body[]): void {
  for (const body of bodies) {
    const center = body.center;
    const up = Math.max(0, body.ground - center.y - 24 * body.scale);

    ctx.fillStyle = `rgba(6,2,0,${0.42 * body.alpha * Math.max(0.2, 1 - up / 160)})`;
    ctx.beginPath();
    ctx.ellipse(
      center.x,
      body.ground + 1,
      body.radius * 1.2 * (1 + up / 220),
      3 * body.scale,
      0,
      0,
      FULL,
    );
    ctx.fill();
  }
}

function bar(ctx: CanvasRenderingContext2D, body: Body, ratio: number, color: string): void {
  const at = head(body);
  const width = 18 * Math.max(0.8, body.scale);
  const y = at.y - 8 * body.scale - 9;

  ctx.fillStyle = 'rgba(0,0,0,.65)';
  ctx.fillRect(at.x - width / 2 - 1, y - 1, width + 2, 4);
  ctx.fillStyle = color;
  ctx.fillRect(at.x - width / 2, y, width * Math.max(0, Math.min(1, ratio)), 2);
}

export function paintBars(ctx: CanvasRenderingContext2D, world: World): void {
  const { battle, party } = world;

  if (!battle || !party) return;
  for (const [id, body] of world.cast.heroes) {
    const hp = battle.vitals[id]?.hp ?? 0;
    const max = heroMaxHp(party, world.roster, id);
    const recent = world.now - body.lastHurt < BAR_SECONDS && hp < max;

    if (hp <= 0 || body.state !== 'stand' || (world.selected !== id && !recent)) continue;
    bar(ctx, body, hp / max, hp / max > LOW ? (body.tint ?? '#7cc35b') : '#ff6b5a');
  }
  battle.foes.forEach((foe, index) => {
    const body = world.cast.foe(index);

    if (body && !foe.boss && foe.hp > 0 && foe.hp < foe.maxHp && body.state === 'stand')
      bar(ctx, body, foe.hp / foe.maxHp, '#ff6b5a');
  });
}

// What the rules hold right now, drawn every frame so it never outlives them: a shield over the
// party, a mark on a foe, stars over a stunned one.
export function paintStates(ctx: CanvasRenderingContext2D, world: World): void {
  const { battle } = world;

  if (!battle) return;
  const shield = battle.shield;

  ctx.save();
  ctx.lineWidth = 1.5;
  if (shield && shield.left > 0) {
    ctx.strokeStyle = `rgba(150,210,255,${0.3 * Math.min(1, shield.left * 2)})`;
    ctx.lineWidth = 1;
    for (const body of world.cast.heroes.values()) {
      if (body.state !== 'stand') continue;
      const center = body.center;

      ctx.beginPath();
      ctx.ellipse(
        center.x,
        center.y - 6 * body.scale,
        16 * body.scale,
        24 * body.scale,
        0,
        0,
        FULL,
      );
      ctx.stroke();
    }
  }
  battle.foes.forEach((foe, index) => {
    const body = world.cast.foe(index);

    if (!body || foe.hp <= 0) return;
    const at = head(body);

    if (foe.mark && foe.mark.left > 0) {
      ctx.strokeStyle = 'rgba(255,90,70,.8)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(at.x, at.y, 9, 0, FULL);
      ctx.moveTo(at.x - 13, at.y);
      ctx.lineTo(at.x + 13, at.y);
      ctx.moveTo(at.x, at.y - 13);
      ctx.lineTo(at.x, at.y + 13);
      ctx.stroke();
    }
    if ((foe.stunned ?? 0) > 0) {
      ctx.fillStyle = '#ffe08a';
      for (let i = 0; i < 3; i += 1) {
        const a = world.frame.time * 5 + i * 2.1;

        ctx.fillRect(at.x + Math.cos(a) * 10 - 1.5, at.y - 14 + Math.sin(a) * 3 - 1.5, 3, 3);
      }
    }
  });
  ctx.restore();
}

// The hero whose sheet is open stands in a ring of its colour, its name over its head.
export function paintSelection(ctx: CanvasRenderingContext2D, world: World, under: boolean): void {
  const id = world.selected;
  const body = id ? world.cast.hero(id) : undefined;

  if (!id || !body) return;
  const tint = body.tint ?? '#ffffff';

  if (under) {
    ctx.strokeStyle = tint;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(body.center.x, body.ground + 1, 16 * body.scale, 4.5 * body.scale, 0, 0, FULL);
    ctx.stroke();

    return;
  }
  const at = head(body);

  ctx.font = `20px ${PIXEL_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = tint;
  ctx.fillText(heroDefById(world.content, id).name.toUpperCase(), at.x, at.y - 22 * body.scale);
}

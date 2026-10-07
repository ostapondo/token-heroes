import { CONTENT, type Content } from '@content';
import { HeroRole } from '@engine';
import { describe, expect, it } from 'vitest';
import { spriteSize } from '../sprites/pixels';
import { CameraId } from './camera';
import { partyFormation, type Recruit } from './formation';
import { floorTop, type Box } from './geometry';
import { packSlot } from './layout';

type HeroDef = Content['heroes'][number];

const everyHero = CONTENT.heroes;
const recruitOf = (hero: HeroDef): Recruit => ({
  role: hero.role,
  attack: hero.attack,
  sprite: spriteSize(hero.sprite),
});
const formationOf = (heroes: readonly HeroDef[]) => partyFormation(heroes.map(recruitOf));
const bottom = (box: Box) => box.y + box.height;
const right = (box: Box) => box.x + box.width;
const FACE_ROWS = 3;
const isTank = (hero: HeroDef) => hero.role === HeroRole.Tank;
const isHealer = (hero: HeroDef) => hero.role === HeroRole.Healer;

function shareInView(heroes: readonly HeroDef[]): { faces: number[]; bodies: number[] } {
  const { boxes, camera } = formationOf(heroes);
  const scale = camera.scale.hero;
  const owner = new Map<string, { index: number; row: number }>();
  const drawOrder = boxes
    .map((box, index) => ({ box, index }))
    .toSorted((left, next) => bottom(left.box) - bottom(next.box) || next.box.x - left.box.x);

  for (const { box, index } of drawOrder) {
    heroes[index]?.sprite.rows.forEach((line, row) => {
      line.split('').forEach((pixel, column) => {
        if (pixel === '.') return;
        for (let dy = 0; dy < scale; dy += 1) {
          for (let dx = 0; dx < scale; dx += 1) {
            owner.set(`${box.x + column * scale + dx}:${box.y + row * scale + dy}`, { index, row });
          }
        }
      });
    });
  }
  const seen = heroes.map(() => ({ face: 0, body: 0 }));

  for (const { index, row } of owner.values()) {
    const share = seen[index];

    if (!share) continue;
    share.body += 1;
    if (row < FACE_ROWS) share.face += 1;
  }

  return {
    faces: heroes.map((hero, index) => {
      const drawn = hero.sprite.rows.slice(0, FACE_ROWS).join('').replaceAll('.', '').length;

      return (seen[index]?.face ?? 0) / (drawn * scale * scale);
    }),
    bodies: heroes.map((hero, index) => {
      const drawn = hero.sprite.rows.join('').replaceAll('.', '').length;

      return (seen[index]?.body ?? 0) / (drawn * scale * scale);
    }),
  };
}

const rightEdges = (heroes: readonly HeroDef[], pick: (hero: HeroDef) => boolean) => {
  const { boxes } = formationOf(heroes);

  return heroes.flatMap((hero, index) => {
    const box = boxes[index];

    return pick(hero) && box ? [right(box)] : [];
  });
};

describe('partyFormation', () => {
  it.each(everyHero.map((_, index) => index + 1))(
    'keeps every face and much of every body in view in a party of %d',
    (size) => {
      const { faces, bodies } = shareInView(everyHero.slice(0, size));

      expect(Math.min(...faces)).toBeGreaterThanOrEqual(0.9);
      expect(Math.min(...bodies)).toBeGreaterThanOrEqual(0.35);
    },
  );

  it('stands every hero on the floor', () => {
    for (const box of formationOf(everyHero).boxes) expect(bottom(box)).toBeGreaterThan(floorTop());
  });

  it('stands tanks nearest the foes and healers farthest from them', () => {
    expect(Math.min(...rightEdges(everyHero, isTank))).toBeGreaterThan(
      Math.max(...rightEdges(everyHero, (hero) => !isTank(hero))),
    );
    expect(Math.max(...rightEdges(everyHero, isHealer))).toBeLessThan(
      Math.min(...rightEdges(everyHero, (hero) => !isHealer(hero))),
    );
  });

  it.each(everyHero.map((_, index) => index + 1))(
    'leaves the pack its ground in a party of %d',
    (size) => {
      const { boxes, camera } = formationOf(everyHero.slice(0, size));
      const packLeft = packSlot(0, { width: 0, height: 0 }, camera).x;

      expect(Math.max(...boxes.map(right))).toBeLessThanOrEqual(packLeft);
    },
  );

  it('keeps the camera close while every role fits one column, then pulls it back', () => {
    const oneOfEach = [HeroRole.Tank, HeroRole.Healer].flatMap((role) =>
      everyHero.filter((hero) => hero.role === role).slice(0, 1),
    );

    expect(formationOf(oneOfEach).camera.id).toBe(CameraId.Close);
    expect(formationOf(everyHero).camera.id).toBe(CameraId.Wide);
  });

  it('moves nobody when a hero joins a column with room', () => {
    const [first, ...rest] = everyHero.filter((hero) => hero.role === HeroRole.Tank);
    const second = rest[0];

    if (!first || !second) throw new Error('Content needs two tanks');
    const healer = everyHero.find((hero) => hero.role === HeroRole.Healer);
    const party = healer ? [first, healer] : [first];
    const before = formationOf(party);
    const after = formationOf([...party, second]);

    expect(after.camera.id).toBe(before.camera.id);
    expect(after.boxes.slice(0, party.length)).toEqual(before.boxes);
  });

  it.each([1, 3, 6, 10, everyHero.length])('gives a party of %d a place each', (size) => {
    const { boxes } = formationOf(everyHero.slice(0, size));

    expect(new Set(boxes.map((box) => `${box.x}:${box.y}`)).size).toBe(size);
  });
});

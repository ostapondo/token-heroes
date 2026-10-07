import { AttackStyle, HeroRole } from '@engine';
import { CAMERAS, CameraId, type Camera } from './camera';
import type { Box } from './geometry';

interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Recruit {
  readonly role: HeroRole;
  readonly attack: AttackStyle;
  readonly sprite: Size;
}

export interface Formation {
  readonly camera: Camera;
  readonly boxes: readonly Box[];
}

interface Column {
  readonly members: readonly number[];
  readonly opensLine: boolean;
}

const PARTY_LEFT = 2;
const LINE_COUNT = 4;

// Battle order is distance to the foe: tanks nearest, then strikers who close in, then
// strikers who shoot or cast, then healers.
function lineOf(recruit: Recruit): number {
  if (recruit.role === HeroRole.Tank) return 0;
  if (recruit.role === HeroRole.Healer) return 3;

  return recruit.attack === AttackStyle.Bash || recruit.attack === AttackStyle.Slash ? 1 : 2;
}

function linesOf(recruits: readonly Recruit[]): number[][] {
  const lines = Array.from({ length: LINE_COUNT }, (): number[] => []);

  recruits.forEach((recruit, index) => lines[lineOf(recruit)]?.push(index));

  return lines.filter((line) => line.length > 0);
}

const columnCount = (lines: readonly (readonly number[])[], depth: number): number =>
  lines.reduce((sum, line) => sum + Math.ceil(line.length / depth), 0);

// The camera stays close while every role fits one column of the close frame, and pulls back
// for good once a role needs more, since a party never shrinks.
function cameraFor(lines: readonly (readonly number[])[]): Camera {
  const close = CAMERAS[CameraId.Close];

  return columnCount(lines, close.party.depth) <= close.party.columns
    ? close
    : CAMERAS[CameraId.Wide];
}

// A line stands as columns of heroes abreast in depth; once the frame runs out of columns,
// every line stands one row deeper.
function columnsOf(lines: readonly (readonly number[])[], camera: Camera): Column[] {
  const { depth, columns, rows } = camera.party;
  const deep = columnCount(lines, depth) <= columns ? depth : rows.length;

  return lines.flatMap((line) =>
    Array.from({ length: Math.ceil(line.length / deep) }, (_, column) => ({
      members: line.slice(column * deep, (column + 1) * deep),
      opensLine: column === 0,
    })),
  );
}

export function partyFormation(recruits: readonly Recruit[]): Formation {
  const lines = linesOf(recruits);
  const camera = cameraFor(lines);
  const { front, rows, pitch, stagger, lineGap, lineRise } = camera.party;
  const sizeOf = (index: number): Size => {
    const sprite = recruits[index]?.sprite ?? { width: 0, height: 0 };

    return { width: sprite.width * camera.scale.hero, height: sprite.height * camera.scale.hero };
  };
  const columns = columnsOf(lines, camera);
  const widest = Math.max(0, ...recruits.map((_, index) => sizeOf(index).width));
  const gaps = columns.filter((column, index) => index > 0 && column.opensLine).length * lineGap;
  const room = front - PARTY_LEFT - widest - gaps;
  const step = columns.length > 1 ? Math.min(pitch, room / (columns.length - 1)) : 0;
  const boxes: Box[] = [];
  let right = front;
  let line = 0;

  columns.forEach((column, index) => {
    if (index > 0 && column.opensLine) {
      right -= lineGap;
      line += 1;
    }
    if (index > 0) right -= step;
    // every second column stands half a row deeper so its faces fall between the ones in front
    const deeper = (index % 2) * stagger + line * lineRise;

    column.members.forEach((member, row) => {
      const size = sizeOf(member);

      boxes[member] = {
        x: Math.round(right - size.width),
        y: (rows[row] ?? 0) - deeper - size.height,
        ...size,
      };
    });
  });

  return { camera, boxes };
}

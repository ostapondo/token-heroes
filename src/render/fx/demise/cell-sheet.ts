import { rgb } from '../../backdrop/tone';
import type { Body, Cell } from './body';

export type Rgb = readonly [number, number, number];
export type Tone = Rgb | string;

const CHANNELS = 4;
const OPAQUE = 255;
const OUTLINE: Rgb = [0, 0, 0];

interface Sheet {
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;
  readonly image: ImageData;
  readonly next: Uint8ClampedArray;
  readonly tones: (Tone | null)[];
}

// A fallen party of nine drawn a rect per pixel was half of the arena's 870 canvas calls a
// frame. As a sheet each body is one image, rewritten only when a cell changes colour.
const sheets = new WeakMap<Body, Map<readonly Cell[], Sheet>>();

function createSheet(cells: readonly Cell[]): Sheet {
  const canvas = document.createElement('canvas');

  // One sheet pixel per cell, with a pixel of room on every side for the outline.
  canvas.width = Math.max(0, ...cells.map((cell) => cell.x)) + 3;
  canvas.height = Math.max(0, ...cells.map((cell) => cell.y)) + 3;
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Canvas 2D is unavailable');
  const image = context.createImageData(canvas.width, canvas.height);

  return { canvas, context, image, next: new Uint8ClampedArray(image.data.length), tones: [] };
}

function sheetOf(body: Body, cells: readonly Cell[]): Sheet {
  const known = sheets.get(body) ?? new Map<readonly Cell[], Sheet>();
  const sheet = known.get(cells) ?? createSheet(cells);

  known.set(cells, sheet);
  sheets.set(body, known);

  return sheet;
}

function put(sheet: Sheet, x: number, y: number, [r, g, b]: Rgb): void {
  const at = (y * sheet.canvas.width + x) * CHANNELS;

  sheet.next[at] = r;
  sheet.next[at + 1] = g;
  sheet.next[at + 2] = b;
  sheet.next[at + 3] = OPAQUE;
}

function changed(sheet: Sheet): boolean {
  const { data } = sheet.image;

  for (let index = 0; index < data.length; index += 1) {
    if (data[index] !== sheet.next[index]) return true;
  }

  return false;
}

// The cells drawn the way the sprite cache draws a sprite: a black outline, then the colours.
// A cell whose tone is null is left out.
export function cellSheet(
  body: Body,
  cells: readonly Cell[],
  toneOf: (cell: Cell) => Tone | null,
  outline: boolean,
): HTMLCanvasElement {
  const sheet = sheetOf(body, cells);

  sheet.next.fill(0);
  sheet.tones.length = 0;
  for (const cell of cells) sheet.tones.push(toneOf(cell));
  if (outline) {
    cells.forEach((cell, index) => {
      if (sheet.tones[index] === null) return;
      for (let dy = 0; dy < 3; dy += 1) {
        for (let dx = 0; dx < 3; dx += 1) put(sheet, cell.x + dx, cell.y + dy, OUTLINE);
      }
    });
  }
  cells.forEach((cell, index) => {
    const tone = sheet.tones[index];

    if (tone === null || tone === undefined) return;
    put(sheet, cell.x + 1, cell.y + 1, typeof tone === 'string' ? rgb(tone) : tone);
  });
  if (changed(sheet)) {
    sheet.image.data.set(sheet.next);
    sheet.context.putImageData(sheet.image, 0, 0);
  }

  return sheet.canvas;
}

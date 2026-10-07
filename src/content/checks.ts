import type { ElementDef } from './model/definitions';
import { PALETTE_SLOTS, TRANSPARENT_PIXEL, type SpriteDef } from './model/sprite';

const HEX_COLOR = /^#[0-9a-f]{6}$/;
const SLOTS = new Set<string>(PALETTE_SLOTS);

export function duplicated(kind: string, values: readonly (string | number)[]): string[] {
  const seen = new Set<string | number>();

  return values.flatMap((value) => {
    if (!seen.has(value)) {
      seen.add(value);

      return [];
    }

    return [`${kind} ${String(value)} is defined twice`];
  });
}

export function colorProblems(owner: string, colors: Readonly<Record<string, string>>): string[] {
  return Object.entries(colors)
    .filter(([, color]) => !HEX_COLOR.test(color))
    .map(([key, color]) => `${owner} ${key} is ${color}, not a lowercase #rrggbb colour`);
}

export function spriteProblems(owner: string, sprite: SpriteDef, recolored: boolean): string[] {
  const problems: string[] = [];
  const fixed = sprite.fixed ?? {};
  const width = sprite.rows[0]?.length ?? 0;

  if (width === 0) problems.push(`${owner} sprite has no pixels`);

  for (const key of Object.keys(fixed)) {
    if (key.length !== 1 || SLOTS.has(key) || key === TRANSPARENT_PIXEL) {
      problems.push(`${owner} sprite fixes "${key}", which is not a free single letter`);
    }
  }
  problems.push(...colorProblems(`${owner} sprite`, fixed));

  sprite.rows.forEach((row, line) => {
    if (row.length !== width) problems.push(`${owner} sprite row ${line} is not ${width} wide`);
    for (const pixel of row) {
      const known =
        pixel === TRANSPARENT_PIXEL || pixel in fixed || (recolored && SLOTS.has(pixel));

      if (!known) problems.push(`${owner} sprite row ${line} uses unknown pixel "${pixel}"`);
    }
  });

  return problems;
}

const NAMING_KEYS = new Set(['kind', 'shape']);

// Every string in a backdrop is a colour, apart from the names of its pieces.
function colorsIn(value: unknown, path: string): (readonly [string, string])[] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value))
    return value.flatMap((item, index) => colorsIn(item, `${path}.${index}`));
  if (typeof value !== 'object' || value === null) return [];

  return Object.entries(value)
    .filter(([key]) => !NAMING_KEYS.has(key))
    .flatMap(([key, item]) => colorsIn(item, `${path}.${key}`));
}

export function elementProblems(element: ElementDef): string[] {
  const owner = `element ${element.id}`;
  const { sky, ground } = element.backdrop;

  return [
    ...colorProblems(`${owner} palette`, element.palette),
    ...colorProblems(owner, { accent: element.accent }),
    ...colorProblems(owner, Object.fromEntries(colorsIn(element.backdrop, 'backdrop'))),
    ...(sky.length < 2 ? [`${owner} sky needs at least two bands`] : []),
    ...(ground.length < 2 ? [`${owner} ground needs at least two bands`] : []),
  ];
}

export const idsOf = (items: readonly { readonly id: string }[]) => items.map((item) => item.id);
export const ordersOf = (items: readonly { readonly order: number }[]) =>
  items.map((item) => item.order);

export function missingReference(
  owner: string,
  kind: string,
  id: string,
  known: Set<string>,
): string[] {
  return known.has(id) ? [] : [`${owner} names ${kind} ${id}, which does not exist`];
}

export function sequenceProblems(kind: string, orders: readonly number[]): string[] {
  const present = new Set(orders);
  const expected = Array.from({ length: orders.length }, (_, index) => index + 1);

  return [
    ...expected
      .filter((order) => !present.has(order))
      .map((order) => `${kind} order ${order} is missing; orders must run 1 to ${orders.length}`),
    ...orders
      .filter((order) => !Number.isInteger(order) || order < 1 || order > orders.length)
      .map((order) => `${kind} order ${order} is outside 1 to ${orders.length}`),
  ];
}

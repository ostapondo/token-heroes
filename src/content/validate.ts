import type { ElementDef } from './model/definitions';
import { PALETTE_SLOTS, TRANSPARENT_PIXEL, type SpriteDef } from './model/sprite';
import type { Content } from './registry';

const HEX_COLOR = /^#[0-9a-f]{6}$/;
const SLOTS = new Set<string>(PALETTE_SLOTS);

function duplicated(kind: string, values: readonly (string | number)[]): string[] {
  const seen = new Set<string | number>();
  return values.flatMap((value) => {
    if (!seen.has(value)) {
      seen.add(value);
      return [];
    }
    return [`${kind} ${String(value)} is defined twice`];
  });
}

function colorProblems(owner: string, colors: Readonly<Record<string, string>>): string[] {
  return Object.entries(colors)
    .filter(([, color]) => !HEX_COLOR.test(color))
    .map(([key, color]) => `${owner} ${key} is ${color}, not a lowercase #rrggbb colour`);
}

function spriteProblems(owner: string, sprite: SpriteDef, recolored: boolean): string[] {
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

function elementProblems(element: ElementDef): string[] {
  const owner = `element ${element.id}`;
  const { sky, floor, accent } = element;
  return [
    ...colorProblems(`${owner} palette`, element.palette),
    ...colorProblems(owner, { sky, floor, accent }),
  ];
}

const idsOf = (items: readonly { readonly id: string }[]) => items.map((item) => item.id);
const ordersOf = (items: readonly { readonly order: number }[]) => items.map((item) => item.order);

function missingReference(owner: string, kind: string, id: string, known: Set<string>): string[] {
  return known.has(id) ? [] : [`${owner} names ${kind} ${id}, which does not exist`];
}

function uniquenessProblems(content: Content): string[] {
  return [
    ...duplicated('element', idsOf(content.elements)),
    ...duplicated('creature', idsOf(content.creatures)),
    ...duplicated('boss', idsOf(content.bosses)),
    ...duplicated('boss order', ordersOf(content.bosses)),
    ...duplicated('enemy', idsOf(content.enemies)),
    ...duplicated('hero', idsOf(content.heroes)),
    ...duplicated('hero order', ordersOf(content.heroes)),
  ];
}

function referenceProblems(content: Content): string[] {
  const elements = new Set(idsOf(content.elements));
  const creatures = new Set(idsOf(content.creatures));
  return [
    ...content.enemies.flatMap((enemy) =>
      missingReference(`enemy ${enemy.id}`, 'element', enemy.element, elements),
    ),
    ...content.bosses.flatMap((boss) => [
      ...missingReference(`boss ${boss.id}`, 'creature', boss.creature, creatures),
      ...missingReference(`boss ${boss.id}`, 'element', boss.element, elements),
    ]),
  ];
}

function artProblems(content: Content): string[] {
  return [
    ...content.elements.flatMap(elementProblems),
    ...content.creatures.flatMap((creature) =>
      spriteProblems(`creature ${creature.id}`, creature.sprite, true),
    ),
    ...content.enemies.flatMap((enemy) => spriteProblems(`enemy ${enemy.id}`, enemy.sprite, true)),
    ...content.heroes.flatMap((hero) => spriteProblems(`hero ${hero.id}`, hero.sprite, false)),
  ];
}

function rosterProblems(content: Content): string[] {
  const starter = content.heroes[0];
  return [
    ...(content.bosses.length === 0 ? ['there are no bosses'] : []),
    ...(content.enemies.length === 0 ? ['there are no enemies'] : []),
    ...(starter?.hireCost === 0 && starter.unlockAtTokens === 0
      ? []
      : ['the first hero must be free and unlocked from the start']),
  ];
}

export function validateContent(content: Content): string[] {
  return [
    ...uniquenessProblems(content),
    ...referenceProblems(content),
    ...artProblems(content),
    ...rosterProblems(content),
  ];
}

import type { Look } from './model/look';
import { PALETTE_SLOTS } from './model/sprite';

const SLOTS = new Set<string>(PALETTE_SLOTS);
const HEX = /^#[0-9a-f]{6}$/u;
// Keys whose strings name a part or a way of drawing rather than a colour.
const NAMES = new Set(['rig', 'form', 'kind', 'shape', 'at', 'stance', 'hands']);

function walk(value: unknown, path: string, recolored: boolean, problems: string[]): void {
  if (typeof value === 'number') {
    if (!(value > 0)) problems.push(`${path} must be a positive number`);
  } else if (typeof value === 'string') {
    const slot = recolored && SLOTS.has(value);

    if (!slot && !HEX.test(value)) problems.push(`${path} "${value}" is not a #rrggbb colour`);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${String(index)}]`, recolored, problems));
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (NAMES.has(key) || typeof item === 'boolean') continue;
      walk(item, `${path}.${key}`, recolored, problems);
    }
  }
}

// Every colour in a look is #rrggbb, or a palette slot where the element recolours the body, and
// every size is positive.
export function lookProblems(owner: string, look: Look, recolored: boolean): string[] {
  const problems: string[] = [];

  walk(look, `${owner} look`, recolored, problems);

  return problems;
}

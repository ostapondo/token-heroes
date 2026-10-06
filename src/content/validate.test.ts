import { describe, expect, it } from 'vitest';
import { defineCreature } from './model/definitions';
import { CONTENT, type Content } from './registry';
import { validateContent } from './validate';

describe('validateContent', () => {
  it('finds no problems in the shipped content', () => {
    expect(validateContent(CONTENT)).toEqual([]);
  });

  it('ships thirty bosses, twelve enemies, ten heroes and nine elements', () => {
    expect(CONTENT.bosses).toHaveLength(30);
    expect(CONTENT.enemies).toHaveLength(12);
    expect(CONTENT.heroes).toHaveLength(10);
    expect(CONTENT.elements).toHaveLength(9);
  });

  it('reports a ragged sprite and an unknown pixel', () => {
    const broken = defineCreature({
      id: 'broken',
      name: 'Broken',
      attack: 'slam',
      hpScale: 1,
      damageScale: 1,
      sprite: { rows: ['aa', 'a', 'aq'] },
    });
    const content: Content = { ...CONTENT, creatures: [...CONTENT.creatures, broken] };

    expect(validateContent(content)).toEqual([
      'creature broken sprite row 1 is not 2 wide',
      'creature broken sprite row 2 uses unknown pixel "q"',
    ]);
  });

  it('reports a boss that names a missing element', () => {
    const boss = { id: 'lost', name: 'Lost', order: 99, creature: 'dragon', element: 'void' };
    const content: Content = { ...CONTENT, bosses: [...CONTENT.bosses, boss] };

    expect(validateContent(content)).toEqual([
      'boss lost names element void, which does not exist',
    ]);
  });
});

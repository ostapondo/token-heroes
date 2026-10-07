import { describe, expect, it } from 'vitest';
import { defineBoss, defineEnemy } from './model/definitions';
import { CreatureId, ElementId } from './model/ids';
import { CONTENT, type Content } from './registry';
import { validateContent } from './validate';

function replaceLastBoss(id: string, order: number): Content {
  const last = CONTENT.bosses.at(-1);

  if (!last) throw new Error('The content has no bosses');

  return {
    ...CONTENT,
    bosses: [...CONTENT.bosses.slice(0, -1), defineBoss({ ...last, id, name: id, order })],
  };
}

describe('validateContent', () => {
  it('finds no problems in the shipped content', () => {
    expect(validateContent(CONTENT)).toEqual([]);
  });

  it('ships a boss for every creature in every element', () => {
    expect(CONTENT.creatures).toHaveLength(8);
    expect(CONTENT.elements).toHaveLength(9);
    expect(CONTENT.bosses).toHaveLength(72);
  });

  it('ships twelve enemies and fourteen heroes', () => {
    expect(CONTENT.enemies).toHaveLength(12);
    expect(CONTENT.heroes).toHaveLength(14);
  });

  it('reports a ragged sprite and an unknown pixel', () => {
    const broken = defineEnemy({
      id: 'broken',
      name: 'Broken',
      element: ElementId.Fire,
      hpScale: 1,
      damageScale: 1,
      sprite: { rows: ['aa', 'a', 'aq'] },
    });
    const content: Content = { ...CONTENT, enemies: [...CONTENT.enemies, broken] };

    expect(validateContent(content)).toEqual([
      'enemy broken sprite row 1 is not 2 wide',
      'enemy broken sprite row 2 uses unknown pixel "q"',
    ]);
  });

  it('reports an element constant without a definition and everything that names it', () => {
    const content: Content = {
      ...CONTENT,
      elements: CONTENT.elements.filter((element) => element.id !== ElementId.Gold),
    };

    expect(validateContent(content)).toEqual([
      'gold has an id constant but no definition',
      'enemy gold-beetle names element gold, which does not exist',
      ...[
        'slime-king',
        'gilded-colossus',
        'miser-wraith',
        'hoard-dragon',
        'golden-knight',
        'jewel-spider',
        'mammon',
        'gilded-mummy',
      ].map((id) => `boss ${id} names element gold, which does not exist`),
    ]);
  });

  it('reports a boss that reuses another boss order', () => {
    expect(validateContent(replaceLastBoss('copy', 1))).toEqual([
      'boss order 1 is defined twice',
      'boss order 72 is missing; orders must run 1 to 72',
    ]);
  });

  it('reports an order that skips ahead', () => {
    expect(validateContent(replaceLastBoss('stray', 99))).toEqual([
      'boss order 72 is missing; orders must run 1 to 72',
      'boss order 99 is outside 1 to 72',
    ]);
  });

  it('reports two bosses that draw the same creature in the same element', () => {
    const twin = defineBoss({
      id: 'twin',
      name: 'Twin',
      order: CONTENT.bosses.length + 1,
      creature: CreatureId.Dragon,
      element: ElementId.Fire,
    });
    const content: Content = { ...CONTENT, bosses: [...CONTENT.bosses, twin] };

    expect(validateContent(content)).toEqual(['boss pairing dragon in fire is defined twice']);
  });
});

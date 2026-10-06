import { describe, expect, it } from 'vitest';
import { defineBoss, defineEnemy } from './model/definitions';
import { CreatureId, ElementId } from './model/ids';
import { CONTENT, type Content } from './registry';
import { validateContent } from './validate';

const extraBoss = (id: string, order: number) =>
  defineBoss({ id, name: id, order, creature: CreatureId.Dragon, element: ElementId.Fire });

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
      'boss slime-king names element gold, which does not exist',
      'boss gilded-colossus names element gold, which does not exist',
    ]);
  });

  it('reports a boss that reuses another boss order', () => {
    const copy = extraBoss('copy', 1);
    const content: Content = { ...CONTENT, bosses: [...CONTENT.bosses.slice(0, -1), copy] };

    expect(validateContent(content)).toEqual([
      'boss order 1 is defined twice',
      'boss order 30 is missing; orders must run 1 to 30',
    ]);
  });

  it('reports an order that skips ahead', () => {
    const stray = extraBoss('stray', 99);
    const content: Content = { ...CONTENT, bosses: [...CONTENT.bosses, stray] };

    expect(validateContent(content)).toEqual([
      'boss order 31 is missing; orders must run 1 to 31',
      'boss order 99 is outside 1 to 31',
    ]);
  });
});

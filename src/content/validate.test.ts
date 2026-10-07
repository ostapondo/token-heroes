import { SuperBossTier } from '@engine';
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

const ofTier = (tier: SuperBossTier) => CONTENT.superBosses.filter((boss) => boss.tier === tier);

describe('validateContent', () => {
  it('finds no problems in the shipped content', () => {
    expect(validateContent(CONTENT)).toEqual([]);
  });

  it('ships a boss for every creature in every element', () => {
    expect(CONTENT.creatures).toHaveLength(8);
    expect(CONTENT.elements).toHaveLength(9);
    expect(CONTENT.bosses).toHaveLength(72);
  });

  it('ships four super bosses of each tier, each in a lair of its own', () => {
    expect(ofTier(SuperBossTier.Medium)).toHaveLength(4);
    expect(ofTier(SuperBossTier.Strong)).toHaveLength(4);
    expect(CONTENT.lairs).toHaveLength(8);
  });

  it('reports a super boss that takes a boss id and another super boss lair', () => {
    const [first, second, ...rest] = CONTENT.superBosses;

    if (!first || !second) throw new Error('The content has too few super bosses');
    const thief = { ...second, id: 'archfiend', lair: first.lair };
    const content: Content = { ...CONTENT, superBosses: [first, thief, ...rest] };

    expect(validateContent(content)).toEqual([
      'super boss archfiend shares its id with a boss',
      `lair of a super boss ${first.lair} is defined twice`,
      `lair ${second.lair} has no super boss`,
    ]);
  });

  it('ships three pack enemies for every boss creature, and fourteen heroes', () => {
    expect(CONTENT.enemies).toHaveLength(3 * CONTENT.creatures.length);
    expect(CONTENT.heroes).toHaveLength(14);
  });

  it('reports a ragged sprite and an unknown pixel', () => {
    const broken = defineEnemy({
      id: 'broken',
      name: 'Broken',
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

  it('reports a backdrop colour that is not #rrggbb and a sky of one band', () => {
    const [first, ...rest] = CONTENT.elements;

    if (!first) throw new Error('The content has no elements');
    const backdrop = { ...first.backdrop, sky: ['#123'], ground: ['#000000', 'red'] };
    const content: Content = { ...CONTENT, elements: [{ ...first, backdrop }, ...rest] };

    expect(validateContent(content)).toEqual([
      `element ${first.id} backdrop.sky.0 is #123, not a lowercase #rrggbb colour`,
      `element ${first.id} backdrop.ground.1 is red, not a lowercase #rrggbb colour`,
      `element ${first.id} sky needs at least two bands`,
    ]);
  });

  it('reports an element constant without a definition and everything that names it', () => {
    const content: Content = {
      ...CONTENT,
      elements: CONTENT.elements.filter((element) => element.id !== ElementId.Gold),
    };

    expect(validateContent(content)).toEqual([
      'gold has an id constant but no definition',
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

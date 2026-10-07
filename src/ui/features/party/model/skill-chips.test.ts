import { CONTENT, toRoster } from '@content';
import { heroById } from '@engine';
import { describe, expect, it } from 'vitest';
import { nextSkillGoal, skillChips, skillMarks } from './skill-chips';
import { chargeCover } from './skill-charge';
import { skillFacts } from './skill-facts';

const roster = toRoster(CONTENT);
const archer = heroById(roster, 'archer');
const mage = heroById(roster, 'fire-mage');

describe('skill chips', () => {
  it('show a skill locked until level ten and name the level it opens at', () => {
    const [meteor] = skillChips(mage, 9, CONTENT);

    expect(meteor).toMatchObject({ id: 'meteor', locked: true, rank: 0, nextRankAt: 10 });
    expect(nextSkillGoal(skillChips(mage, 9, CONTENT), 9)).toMatchObject({
      opens: true,
      levels: 1,
    });
  });

  it("rank the archer's two skills in turn and point at the nearer one", () => {
    const chips = skillChips(archer, 34, CONTENT);

    expect(chips.map((chip) => [chip.id, chip.rank])).toEqual([
      ['arrow-rain', 3],
      ['snipe', 2],
    ]);
    expect(nextSkillGoal(chips, 34)).toEqual({ name: 'Snipe', rank: 3, opens: false, levels: 1 });
  });

  it('take the evolved name from rank five', () => {
    const [rain] = skillChips(archer, 50, CONTENT);

    expect(rain).toMatchObject({ rank: 5, tier: 2, name: 'Starfall' });
  });

  it('mark every rank before the next ×4, the evolution among them', () => {
    const marks = skillMarks(skillChips(archer, 34, CONTENT), 34);

    expect(marks.map((mark) => mark.at).toSorted((left, right) => left - right)).toEqual([
      0.4, 0.6, 0.8, 1,
    ]);
    expect(marks.filter((mark) => mark.evolves)).toHaveLength(1);
  });

  it('describe what a skill does at its form', () => {
    const [meteor] = skillChips(mage, 30, CONTENT);

    expect(meteor && skillFacts(meteor).map((fact) => fact.kind)).toEqual(['hit', 'reach', 'burn']);
  });
});

describe('chargeCover', () => {
  it('covers the icon while the skill recharges, in whole pixels', () => {
    expect(chargeCover(null, 10, 14)).toBe(0);
    expect(chargeCover(10, 10, 14)).toBe(1);
    expect(chargeCover(5, 10, 14)).toBeCloseTo(7 / 14);
  });
});

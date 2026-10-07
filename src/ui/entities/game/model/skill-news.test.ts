import { CONTENT, toRoster } from '@content';
import { heroById } from '@engine';
import { describe, expect, it } from 'vitest';
import { skillNews } from './skill-news';

const roster = toRoster(CONTENT);
const mage = heroById(roster, 'fire-mage');
const archer = heroById(roster, 'archer');

describe('skillNews', () => {
  it('tells when a hero learns a skill, ranks it up or evolves it', () => {
    expect(skillNews(CONTENT, mage, 9, 10)).toBe('Fire Mage learned Meteor');
    expect(skillNews(CONTENT, mage, 29, 30)).toBe('Meteor reached rank III');
    expect(skillNews(CONTENT, mage, 49, 50)).toBe('Meteor evolves into Meteor Shower');
  });

  it('says nothing for a level that changes no skill', () => {
    expect(skillNews(CONTENT, archer, 33, 34)).toBeNull();
    expect(skillNews(CONTENT, archer, 34, 35)).toBe('Snipe reached rank III');
  });
});

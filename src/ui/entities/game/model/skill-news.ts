import { type Content, heroDefById, skillDefById } from '@content';
import { formTier, type HeroStats, rankedSkills } from '@engine';
import { t } from '@i18n';
import { rankNumeral } from '@render';

// What a new level did to a hero's skills, as a line for the notice toast; null when nothing.
export function skillNews(
  content: Content,
  hero: HeroStats,
  before: number,
  after: number,
): string | null {
  const [news] = rankedSkills(hero, before, after);

  if (!news) return null;
  const skill = skillDefById(content, news.skill.id);
  const { rank } = news;

  if (rank === 1)
    return t('notice.skillLearned', {
      hero: heroDefById(content, hero.id).name,
      skill: skill.name,
    });
  if (formTier(rank) === 2 && formTier(rank - 1) < 2) {
    return t('notice.skillEvolved', { skill: skill.name, evolved: skill.evolved });
  }

  return t('notice.skillRanked', {
    skill: formTier(rank) === 2 ? skill.evolved : skill.name,
    rank: rankNumeral(rank),
  });
}

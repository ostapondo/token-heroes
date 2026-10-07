import { SkillTrigger } from '@engine';
import { t } from '@i18n';
import { compactNumber, rankNumeral } from '@render';
import type { CSSProperties } from 'react';
import { type SkillFact, skillFacts } from '../model/skill-facts';
import type { SkillChip } from '../types';
import { skillCardRecipe } from './skill-card.recipe';

type ColorStyle = CSSProperties & Record<'--skill-color', string>;

const PERCENT = 100;
const SEPARATOR = ' · ';

function unknownFact(fact: never): never {
  throw new Error(`No text for the skill fact ${JSON.stringify(fact)}`);
}

function factText(fact: SkillFact): string {
  switch (fact.kind) {
    case 'hit':
      return t('skill.hit', { amount: compactNumber(fact.amount) });
    case 'reach':
      return t('skill.reach', { count: fact.count, percent: fact.percent });
    case 'burn':
      return t('skill.burn', { seconds: fact.seconds });
    case 'stun':
      return t('skill.stun');
    case 'mark':
      return t('skill.mark', { seconds: fact.seconds });
    case 'shield':
      return t('skill.shield', { seconds: fact.seconds });
    case 'heal':
      return t('skill.heal');
    case 'deflect':
      return t('skill.deflect');
    default:
      return unknownFact(fact);
  }
}

function rhythmText(chip: SkillChip): string {
  const charge =
    chip.charge === null ? '' : `${SEPARATOR}${t('skill.charge', { seconds: chip.charge })}`;

  if (chip.trigger === SkillTrigger.OnHit) {
    return t('skill.onHit', { percent: Math.round((chip.chance ?? 0) * PERCENT) });
  }
  if (chip.trigger === SkillTrigger.OnGuard) {
    return t('skill.onGuard', { percent: Math.round((chip.chance ?? 0) * PERCENT) });
  }

  return `${t('skill.every', { seconds: chip.cooldown ?? 0 })}${charge}`;
}

// What a skill does, how often, and when it next grows: opened from its icon in the row.
export function SkillCard({ chip }: { readonly chip: SkillChip }) {
  const classes = skillCardRecipe();
  const style: ColorStyle = { '--skill-color': chip.color };
  const rank = chip.locked
    ? t('skill.opens', { level: chip.nextRankAt })
    : t('skill.rank', { rank: rankNumeral(chip.rank) });
  const next = chip.locked
    ? null
    : t('skill.next', {
        rank: rankNumeral(chip.rank + 1),
        level: chip.nextRankAt,
      });
  const rhythm = [rank, rhythmText(chip)].join(SEPARATOR);
  const evolves =
    chip.evolvesAt === null || chip.evolvesAt === chip.nextRankAt
      ? null
      : t('skill.evolves', { name: chip.evolved, level: chip.evolvesAt });

  const growth = [next, evolves].filter((part) => part !== null).join(SEPARATOR);

  return (
    <div className={classes.root} style={style}>
      <span className={classes.title}>{chip.name}</span>
      <span className={classes.rhythm}>{rhythm}</span>
      <ul className={classes.facts}>
        {skillFacts(chip).map((fact) => (
          <li key={fact.kind}>{factText(fact)}</li>
        ))}
      </ul>
      {growth ? <span className={classes.next}>{growth}</span> : null}
    </div>
  );
}

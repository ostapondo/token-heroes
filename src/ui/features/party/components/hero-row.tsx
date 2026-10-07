import { BALANCE } from '@engine';
import { t, tCount } from '@i18n';
import { compactNumber, rankNumeral } from '@render';
import { cx } from '@styled/css';
import { panel, pixelButton } from '@styled/recipes';
import { useState } from 'react';
import { Meter } from '../../../shared/ui';
import { EVOLVED_MARK } from '../constants';
import type { HeroRowModel, SkillGoal } from '../types';
import { rowRecipe } from './party.recipe';
import { RoleLine } from './role-line';
import { SkillCard } from './skill-card';
import { SkillIcon } from './skill-icon';

interface Props {
  readonly row: HeroRowModel;
  readonly onLevelUp: (heroId: string) => void;
}

function goalText(goal: SkillGoal, level: number): string {
  if (goal.opens) return t('party.skill.opensAt', { skill: goal.name, level: level + goal.levels });

  return tCount('party.skill.next', goal.levels, undefined, {
    skill: goal.name,
    rank: rankNumeral(goal.rank),
  });
}

export function HeroRow({ row, onLevelUp }: Props) {
  const classes = rowRecipe();
  const [open, setOpen] = useState<string | null>(null);
  const cost = compactNumber(row.cost);
  const milestone = tCount('party.milestone', row.levelsToMilestone, undefined, {
    multiplier: BALANCE.milestoneMultiplier,
  });
  const note = row.goal ? `${goalText(row.goal, row.level)} · ${milestone}` : milestone;
  const marks = row.marks.map((mark) => ({
    at: mark.at,
    color: mark.evolves ? EVOLVED_MARK : mark.color,
    strong: mark.evolves,
  }));
  const card = row.skills.find((chip) => chip.id === open);
  const toggle = (skillId: string) => setOpen((current) => (current === skillId ? null : skillId));

  return (
    <li className={cx(panel(), classes.root)}>
      <div className={classes.body}>
        <div className={classes.header}>
          <span className={classes.name}>{row.name}</span>
          <span className={classes.skills}>
            {row.skills.map((chip) => (
              <SkillIcon key={chip.id} chip={chip} open={chip.id === open} onToggle={toggle} />
            ))}
          </span>
          <span className={classes.level}>{t('party.level', { level: row.level })}</span>
        </div>
        <RoleLine action={row.action} />
        <Meter value={row.milestoneProgress} label={milestone} marks={marks} />
        <span className={classes.note}>{note}</span>
        {card ? <SkillCard chip={card} /> : null}
      </div>
      <button
        type="button"
        disabled={!row.affordable}
        aria-label={t('party.levelUpLabel', { name: row.name, cost })}
        className={pixelButton({ tone: row.affordable ? 'coin' : 'muted' })}
        onClick={() => onLevelUp(row.heroId)}
      >
        {t('party.levelUp', { cost })}
      </button>
    </li>
  );
}

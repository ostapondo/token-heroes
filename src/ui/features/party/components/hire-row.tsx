import { t } from '@i18n';
import { compactNumber } from '@render';
import { cx } from '@styled/css';
import { panel, pixelButton } from '@styled/recipes';
import { useState } from 'react';
import type { HireRowModel } from '../types';
import { rowRecipe } from './party.recipe';
import { RoleLine } from './role-line';
import { SkillCard } from './skill-card';
import { SkillIcon } from './skill-icon';

interface Props {
  readonly row: HireRowModel;
  readonly onHire: (heroId: string) => void;
}

export function HireRow({ row, onHire }: Props) {
  const classes = rowRecipe();
  const [open, setOpen] = useState<string | null>(null);
  const card = row.skills.find((chip) => chip.id === open);
  const toggle = (skillId: string) => setOpen((current) => (current === skillId ? null : skillId));
  const cost = compactNumber(row.cost);
  const note = row.unlocked
    ? t('party.ready')
    : t('party.unlocksAt', { tokens: compactNumber(row.unlockAtTokens) });

  return (
    <li className={cx(panel({ outline: 'dashed' }), classes.root)}>
      <div className={classes.body}>
        <div className={classes.header}>
          <span className={classes.name}>{row.name}</span>
          <span className={classes.skills}>
            {row.skills.map((chip) => (
              <SkillIcon
                key={chip.id}
                chip={chip}
                open={chip.id === open}
                onToggle={toggle}
                preview
              />
            ))}
          </span>
        </div>
        <RoleLine action={row.action} />
        <span className={classes.note}>{note}</span>
        {card ? <SkillCard chip={card} /> : null}
      </div>
      {row.unlocked ? (
        <button
          type="button"
          disabled={!row.affordable}
          aria-label={t('party.hireLabel', { name: row.name, cost })}
          className={pixelButton({ tone: row.affordable ? 'coin' : 'muted' })}
          onClick={() => onHire(row.heroId)}
        >
          {t('party.hire', { cost })}
        </button>
      ) : null}
    </li>
  );
}

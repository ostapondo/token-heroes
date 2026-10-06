import { t } from '@i18n';
import { compactNumber } from '@render';
import { cx } from '@styled/css';
import { panel, pixelButton } from '@styled/recipes';
import type { HireRowModel } from '../types';
import { rowRecipe } from './party.recipe';

interface Props {
  readonly row: HireRowModel;
  readonly onHire: (heroId: string) => void;
}

export function HireRow({ row, onHire }: Props) {
  const classes = rowRecipe();
  const cost = compactNumber(row.cost);
  const note = row.unlocked
    ? t('party.ready')
    : t('party.unlocksAt', { tokens: compactNumber(row.unlockAtTokens) });

  return (
    <li className={cx(panel({ outline: 'dashed' }), classes.root)}>
      <div className={classes.body}>
        <span className={classes.name}>{row.name}</span>
        <span className={classes.note}>{note}</span>
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

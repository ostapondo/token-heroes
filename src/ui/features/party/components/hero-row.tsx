import { t, tCount } from '@i18n';
import { compactNumber } from '@render';
import { cx } from '@styled/css';
import { panel, pixelButton } from '@styled/recipes';
import { Meter } from '../../../shared/ui';
import type { HeroRowModel } from '../types';
import { rowRecipe } from './party.recipe';
import { RoleLine } from './role-line';

interface Props {
  readonly row: HeroRowModel;
  readonly onLevelUp: (heroId: string) => void;
}

export function HeroRow({ row, onLevelUp }: Props) {
  const classes = rowRecipe();
  const cost = compactNumber(row.cost);
  const milestone = tCount('party.milestone', row.levelsToMilestone);

  return (
    <li className={cx(panel(), classes.root)}>
      <div className={classes.body}>
        <div className={classes.header}>
          <span className={classes.name}>{row.name}</span>
          <span className={classes.level}>{t('party.level', { level: row.level })}</span>
        </div>
        <RoleLine action={row.action} />
        <Meter value={row.milestoneProgress} label={milestone} />
        <span className={classes.note}>{milestone}</span>
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

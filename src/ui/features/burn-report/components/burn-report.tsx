import { t } from '@i18n';
import { useMemo, useState } from 'react';
import { selectBurned, useGame } from '../../../entities/game';
import { RANGE_LABEL } from '../constants';
import { useBurnHistory } from '../hooks/use-burn-history';
import { burnView } from '../model/burn-view';
import { BurnRange } from '../types';
import { BurnDetails } from './burn-details';
import { burnReportRecipe } from './burn-report.recipe';

const RANGES = [BurnRange.Today, BurnRange.Fortnight, BurnRange.All] as const;

export function BurnReport() {
  const [range, setRange] = useState<BurnRange>(BurnRange.Today);
  const { history, readAt, failed } = useBurnHistory();
  const burnedInAll = useGame(selectBurned);
  const classes = burnReportRecipe();
  const view = useMemo(
    () => (history ? burnView(history, range, burnedInAll, readAt) : null),
    [history, range, burnedInAll, readAt],
  );

  return (
    <div className={classes.root}>
      <div className={classes.ranges} role="group" aria-label={t('burn.ranges')}>
        {RANGES.map((option) => (
          <button
            key={option}
            type="button"
            className={classes.range}
            aria-pressed={option === range}
            onClick={() => setRange(option)}
          >
            {t(RANGE_LABEL[option])}
          </button>
        ))}
      </div>
      {view ? (
        <BurnDetails view={view} range={range} now={readAt} />
      ) : (
        <p className={classes.note}>{t(failed ? 'burn.unavailable' : 'burn.loading')}</p>
      )}
    </div>
  );
}

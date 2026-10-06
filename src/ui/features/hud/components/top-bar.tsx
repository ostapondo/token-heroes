import { t } from '@i18n';
import { compactNumber } from '@render';
import { selectBalance, selectIncome, selectStage, useGame } from '../../../entities/game';
import { CoinIcon } from '../../../shared/ui';
import { topBarRecipe } from './top-bar.recipe';

export function TopBar() {
  const stage = useGame(selectStage);
  const balance = useGame(selectBalance);
  const income = useGame(selectIncome);
  const classes = topBarRecipe();

  return (
    <header className={classes.root}>
      <span className={classes.stage}>{t('hud.stage', { stage })}</span>
      <span className={classes.wallet}>
        {income.count > 0 ? (
          <span key={income.count} className={classes.income}>
            {t('hud.income', { tokens: compactNumber(income.amount) })}
          </span>
        ) : null}
        <CoinIcon />
        {t('hud.coins', { coins: compactNumber(balance) })}
      </span>
    </header>
  );
}

import { t } from '@i18n';
import { compactNumber } from '@render';
import {
  selectBalance,
  selectBurned,
  selectIncome,
  selectStage,
  useGame,
} from '../../../entities/game';
import { selectOffer, useReleaseState } from '../../../entities/release';
import { CoinIcon, IconButton } from '../../../shared/ui';
import { Ascension } from './ascension';
import { topBarRecipe } from './top-bar.recipe';

interface Props {
  readonly onOpenMenu: () => void;
}

export function TopBar({ onOpenMenu }: Props) {
  const stage = useGame(selectStage);
  const offer = useReleaseState(selectOffer);
  const balance = useGame(selectBalance);
  const burned = useGame(selectBurned);
  const income = useGame(selectIncome);
  const classes = topBarRecipe();

  return (
    <header className={classes.root}>
      <div className={classes.progress}>
        <span className={classes.stage}>{t('hud.stage', { stage })}</span>
        <Ascension />
      </div>
      <div className={classes.purse}>
        <span className={classes.wallet}>
          {income.count > 0 ? (
            <span key={income.count} className={classes.income}>
              {t('hud.income', { tokens: compactNumber(income.amount) })}
            </span>
          ) : null}
          <CoinIcon />
          {t('hud.coins', { coins: compactNumber(balance) })}
        </span>
        <span className={classes.burned}>{t('hud.burned', { burned: compactNumber(burned) })}</span>
      </div>
      <IconButton glyph="menu" label={t('menu.open')} onClick={onOpenMenu} badge={offer !== null} />
    </header>
  );
}

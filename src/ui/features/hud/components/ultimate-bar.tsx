import { strikeDamage } from '@engine';
import { t } from '@i18n';
import { compactNumber } from '@render';
import { pixelButton } from '@styled/recipes';
import { selectParty, selectUltimatePercent, useGame, useSession } from '../../../entities/game';
import { Meter } from '../../../shared/ui';
import { ultimateBarRecipe } from './ultimate-bar.recipe';

const FULL_CHARGE = 100;

export function UltimateBar() {
  const session = useSession();
  const percent = useGame(selectUltimatePercent);
  const party = useGame(selectParty);
  const damage = party ? compactNumber(strikeDamage(party, session.roster)) : null;
  const ready = percent >= FULL_CHARGE;
  const classes = ultimateBarRecipe();

  return (
    <div className={classes.root}>
      <div className={classes.gauge}>
        <div className={classes.caption}>
          <span className={classes.hint}>
            {t('ultimate.hint')}
            {damage && <span className={classes.strike}>{damage}</span>}
          </span>
          <span>{t('ultimate.charge', { percent })}</span>
        </div>
        <Meter
          value={percent / FULL_CHARGE}
          label={t('ultimate.chargeLabel')}
          tone="ultimate"
          size="framed"
        />
      </div>
      <button
        type="button"
        disabled={!ready}
        onClick={session.unleashUltimate}
        className={pixelButton({ tone: ready ? 'ultimate' : 'muted', lettering: 'display' })}
      >
        {t('ultimate.button')}
      </button>
    </div>
  );
}

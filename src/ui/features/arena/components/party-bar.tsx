import { t } from '@i18n';
import { compactNumber } from '@render';
import { selectParty, selectPartyHp, useGame, useSession } from '../../../entities/game';
import { Meter } from '../../../shared/ui';
import { partyHealth } from '../model/party-health';
import { partyBarRecipe } from './party-bar.recipe';

export function PartyBar() {
  const session = useSession();
  const party = useGame(selectParty);
  const hp = useGame(selectPartyHp);
  const classes = partyBarRecipe();

  if (!party) return null;
  const health = partyHealth(hp, party, session.roster);

  return (
    <div className={classes.root}>
      <Meter
        value={health.hp / health.maxHp}
        label={t('arena.partyHealth')}
        tone="heal"
        size="thin"
      />
      <span className={classes.hp}>
        {t('arena.partyHp', {
          hp: compactNumber(health.hp),
          maxHp: compactNumber(health.maxHp),
        })}
      </span>
    </div>
  );
}

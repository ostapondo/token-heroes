import { CONTENT } from '@content';
import { t } from '@i18n';
import { compactNumber } from '@render';
import {
  selectParty,
  selectPartyHp,
  selectVitals,
  useGame,
  useSession,
} from '../../../entities/game';
import { Meter } from '../../../shared/ui';
import { heroesHealth, partyHealth } from '../model/party-health';
import { partyBarRecipe } from './party-bar.recipe';

// One bar per hero in its own colour, so a hero about to go down shows before it does.
export function PartyBar() {
  const session = useSession();
  const party = useGame(selectParty);
  const hp = useGame(selectPartyHp);
  const vitals = useGame(selectVitals);
  const classes = partyBarRecipe();

  if (!party || !vitals) return null;
  const total = partyHealth(hp, party, session.roster);
  const heroes = heroesHealth(vitals, party, session.roster, CONTENT);

  return (
    <div className={classes.root}>
      <div className={classes.heroes}>
        {heroes.map((hero) => (
          <Meter
            key={hero.heroId}
            value={hero.hp / hero.maxHp}
            label={t('arena.heroHp', {
              name: hero.name,
              hp: compactNumber(hero.hp),
              maxHp: compactNumber(hero.maxHp),
            })}
            accent={hero.tint}
            tone="accent"
            size="thin"
          />
        ))}
      </div>
      <span className={classes.hp}>
        {t('arena.partyHp', { hp: compactNumber(total.hp), maxHp: compactNumber(total.maxHp) })}
      </span>
    </div>
  );
}

import { useSession } from '../../../entities/game';
import { usePartyRows } from '../hooks/use-party-rows';
import { HeroRow } from './hero-row';
import { HireRow } from './hire-row';
import { partyListStyle } from './party.recipe';

export function PartyPanel() {
  const session = useSession();
  const { members, recruits } = usePartyRows();

  return (
    <ul className={partyListStyle}>
      {members.map((row) => (
        <HeroRow key={row.heroId} row={row} onLevelUp={session.levelUp} />
      ))}
      {recruits.map((row) => (
        <HireRow key={row.heroId} row={row} onHire={session.hire} />
      ))}
    </ul>
  );
}

import { useState } from 'react';
import { useSession } from '../../../entities/game';
import { usePartyRows } from '../hooks/use-party-rows';
import { HeroRow } from './hero-row';
import { HireRow } from './hire-row';
import { partyListStyle } from './party.recipe';

export function PartyPanel() {
  const session = useSession();
  const { members, recruits } = usePartyRows();
  const [watched, setWatched] = useState<string | null>(null);
  const watch = (heroId: string) => {
    const next = watched === heroId ? null : heroId;

    setWatched(next);
    session.watch(next);
  };

  return (
    <ul className={partyListStyle}>
      {members.map((row) => (
        <HeroRow
          key={row.heroId}
          row={row}
          watched={row.heroId === watched}
          onWatch={watch}
          onLevelUp={session.levelUp}
        />
      ))}
      {recruits.map((row) => (
        <HireRow key={row.heroId} row={row} onHire={session.hire} />
      ))}
    </ul>
  );
}

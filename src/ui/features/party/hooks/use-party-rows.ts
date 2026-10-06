import { CONTENT } from '@content';
import { useMemo } from 'react';
import {
  selectBalance,
  selectBurned,
  selectParty,
  useGame,
  useSession,
} from '../../../entities/game';
import { partyRows } from '../model/party-rows';
import type { PartyRows } from '../types';

const NO_ROWS: PartyRows = { members: [], recruits: [] };

export function usePartyRows(): PartyRows {
  const { roster } = useSession();
  const party = useGame(selectParty);
  const balance = useGame(selectBalance);
  const burned = useGame(selectBurned);

  return useMemo(
    () => (party ? partyRows(party, { balance, burned }, roster, CONTENT) : NO_ROWS),
    [party, balance, burned, roster],
  );
}

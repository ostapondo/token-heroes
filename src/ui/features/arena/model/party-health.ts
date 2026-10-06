import { partyMaxHp, type PartyState, type Roster } from '@engine';

export interface PartyHealth {
  readonly hp: number;
  readonly maxHp: number;
}

export function partyHealth(hp: number, party: PartyState, roster: Roster): PartyHealth {
  const maxHp = partyMaxHp(party, roster);

  return { hp: Math.min(Math.max(Math.ceil(hp), 0), maxHp), maxHp };
}

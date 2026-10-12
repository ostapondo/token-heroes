import { heroDefById, type Content } from '@content';
import { heroMaxHp, partyMaxHp, type BattleState, type PartyState, type Roster } from '@engine';

export interface PartyHealth {
  readonly hp: number;
  readonly maxHp: number;
}

export interface HeroHealth extends PartyHealth {
  readonly heroId: string;
  readonly name: string;
  readonly tint: string;
}

const shown = (hp: number, maxHp: number): number => Math.min(Math.max(Math.ceil(hp), 0), maxHp);

export function partyHealth(hp: number, party: PartyState, roster: Roster): PartyHealth {
  const maxHp = partyMaxHp(party, roster);

  return { hp: shown(hp, maxHp), maxHp };
}

// Every hero's own health in party order; a hero the battle has not met yet stands at full.
export function heroesHealth(
  vitals: BattleState['vitals'],
  party: PartyState,
  roster: Roster,
  content: Content,
): HeroHealth[] {
  return party.heroes.map(({ heroId }) => {
    const { name, tint } = heroDefById(content, heroId);
    const maxHp = heroMaxHp(party, roster, heroId);

    return { heroId, name, tint, hp: shown(vitals[heroId]?.hp ?? maxHp, maxHp), maxHp };
  });
}

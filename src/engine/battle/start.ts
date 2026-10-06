import { BALANCE } from '../balance';
import { partyMaxHp } from '../party';
import { heroById } from '../roster';
import type { BattleState, PartyState, Roster } from '../types';
import { foesForStage } from './stages';

export function startStage(
  stage: number,
  party: PartyState,
  roster: Roster,
  carried: Pick<BattleState, 'seed' | 'ultimate'>,
): BattleState {
  return {
    stage,
    phase: 'fighting',
    phaseLeft: 0,
    foes: foesForStage(roster, stage),
    partyHp: partyMaxHp(party, roster),
    cooldowns: Object.fromEntries(
      party.heroes.map((slot, order) => [
        slot.heroId,
        heroById(roster, slot.heroId).attackInterval *
          (BALANCE.openingCooldown + order * BALANCE.openingStagger),
      ]),
    ),
    bossTimeLeft: BALANCE.bossTimeLimit,
    strikeReadyIn: 0,
    ultimate: carried.ultimate,
    seed: carried.seed,
  };
}

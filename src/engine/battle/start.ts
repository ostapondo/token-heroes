import { BALANCE } from '../balance';
import { partyMaxHp } from '../party';
import { heroById } from '../roster';
import { BattlePhase, type BattleState, type PartyState, type Roster } from '../types';
import { foesForStage } from './stages';

export function startStage(
  stage: number,
  party: PartyState,
  roster: Roster,
  carried: Pick<BattleState, 'seed' | 'ultimate'>,
): BattleState {
  return {
    stage,
    phase: BattlePhase.Fighting,
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

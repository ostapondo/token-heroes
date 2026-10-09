import { BALANCE } from '../balance';
import { heroById } from '../roster';
import { freshSkills } from '../skills/tick';
import { BattlePhase, type BattleState, type PartyState, type Roster } from '../types';
import { foesForStage, isBossStage } from './stages';
import { freshVitals } from './vitals';

export function startStage(
  stage: number,
  party: PartyState,
  roster: Roster,
  carried: Pick<BattleState, 'seed' | 'ultimate'> & Partial<Pick<BattleState, 'skills'>>,
): BattleState {
  return {
    stage,
    phase: BattlePhase.Fighting,
    phaseLeft: 0,
    foes: foesForStage(roster, stage),
    vitals: freshVitals(party, roster),
    cooldowns: Object.fromEntries(
      party.heroes.map((slot, order) => [
        slot.heroId,
        heroById(roster, slot.heroId).attackInterval *
          (BALANCE.openingCooldown + order * BALANCE.openingStagger),
      ]),
    ),
    strikeReadyIn: 0,
    ultimate: carried.ultimate,
    seed: carried.seed,
    skills: freshSkills(party, roster, carried.skills, isBossStage(stage)),
  };
}

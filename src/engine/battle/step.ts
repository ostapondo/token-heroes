import { BALANCE } from '../balance';
import { heroDamage } from '../formulas';
import { partyMaxHp } from '../party';
import { nextRandom } from '../random';
import { heroById } from '../roster';
import type { BattleEvent, BattleState, BattleStep, PartyState, Roster } from '../types';
import { damageFront, draftOf, frontFoe, settleClear, wipe, type BattleDraft } from './draft';
import { isBossStage } from './stages';
import { startStage } from './start';

export function stepBattle(
  battle: BattleState,
  dt: number,
  party: PartyState,
  roster: Roster,
): BattleStep {
  if (battle.phase === 'fighting') return fight(battle, dt, party, roster);
  return battle.phase === 'wiped'
    ? afterDelay(battle, dt, party, roster, battle.stage, 'respawned')
    : afterDelay(battle, dt, party, roster, battle.stage + 1, 'stageStarted');
}

function afterDelay(
  battle: BattleState,
  dt: number,
  party: PartyState,
  roster: Roster,
  stage: number,
  type: 'respawned' | 'stageStarted',
): BattleStep {
  const phaseLeft = battle.phaseLeft - dt;
  if (phaseLeft > 0) return { battle: { ...battle, phaseLeft }, events: [] };
  return { battle: startStage(stage, party, roster, battle), events: [{ type, stage }] };
}

function fight(battle: BattleState, dt: number, party: PartyState, roster: Roster): BattleStep {
  const draft = draftOf(battle);
  const events: BattleEvent[] = [];
  draft.strikeReadyIn = Math.max(0, draft.strikeReadyIn - dt);

  if (isBossStage(draft.stage)) {
    draft.bossTimeLeft -= dt;
    if (draft.bossTimeLeft <= 0) {
      wipe(draft, 'timeout', events);
      return { battle: draft, events };
    }
  }

  heroesAct(draft, dt, party, roster, events);
  if (settleClear(draft, events)) return { battle: draft, events };

  foesAct(draft, dt, events);
  if (draft.partyHp <= 0) wipe(draft, 'defeat', events);
  return { battle: draft, events };
}

function heroesAct(
  draft: BattleDraft,
  dt: number,
  party: PartyState,
  roster: Roster,
  events: BattleEvent[],
): void {
  const maxHp = partyMaxHp(party, roster);
  for (const slot of party.heroes) {
    const hero = heroById(roster, slot.heroId);
    let cooldown = (draft.cooldowns[hero.id] ?? 0) - dt;
    while (cooldown <= 0 && frontFoe(draft) !== -1) {
      const power = heroDamage(hero, slot.level);
      if (hero.role === 'healer') {
        const amount = Math.ceil(power * BALANCE.healerShare);
        draft.partyHp = Math.min(maxHp, draft.partyHp + amount);
        events.push({ type: 'heal', source: hero.id, amount });
      } else {
        const [roll, seed] = nextRandom(draft.seed);
        draft.seed = seed;
        const crit = roll < BALANCE.critChance;
        const amount = crit ? Math.ceil(power * BALANCE.critMultiplier) : power;
        damageFront(draft, amount, events, (foe) => ({
          type: 'hit',
          source: hero.id,
          foe,
          amount,
          crit,
        }));
      }
      cooldown += hero.attackInterval;
    }
    draft.cooldowns[hero.id] = Math.max(cooldown, 0);
  }
}

function foesAct(draft: BattleDraft, dt: number, events: BattleEvent[]): void {
  draft.foes.forEach((foe, index) => {
    if (foe.hp <= 0) return;
    foe.attackIn -= dt;
    while (foe.attackIn <= 0) {
      draft.partyHp -= foe.damage;
      events.push({ type: 'partyHit', foe: index, amount: foe.damage });
      foe.attackIn += foe.attackInterval;
    }
  });
}

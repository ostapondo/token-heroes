import { BALANCE } from '../balance';
import { heroDamage, heroHeal, safeAmount } from '../formulas';
import { partyVitals, renownPower } from '../party';
import { nextRandom } from '../random';
import { heroById } from '../roster';
import {
  type BattleEvent,
  BattleEventType,
  BattlePhase,
  type BattleState,
  type BattleStep,
  HeroRole,
  type PartyState,
  type Roster,
  WipeReason,
} from '../types';
import { damageFront, draftOf, frontFoe, settleClear, wipe, type BattleDraft } from './draft';
import { isBossStage } from './stages';
import { startStage } from './start';

export function stepBattle(
  battle: BattleState,
  dt: number,
  party: PartyState,
  roster: Roster,
): BattleStep {
  if (battle.phase === BattlePhase.Fighting) return fight(battle, dt, party, roster);

  return battle.phase === BattlePhase.Wiped
    ? afterDelay(battle, dt, party, roster, battle.stage, BattleEventType.Respawned)
    : afterDelay(battle, dt, party, roster, battle.stage + 1, BattleEventType.StageStarted);
}

function afterDelay(
  battle: BattleState,
  dt: number,
  party: PartyState,
  roster: Roster,
  stage: number,
  type: typeof BattleEventType.Respawned | typeof BattleEventType.StageStarted,
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
      wipe(draft, WipeReason.Timeout, events);

      return { battle: draft, events };
    }
  }

  heroesAct(draft, dt, party, roster, events);
  if (settleClear(draft, events)) return { battle: draft, events };

  foesAct(draft, dt, events);
  if (draft.partyHp <= 0) wipe(draft, WipeReason.Defeat, events);

  return { battle: draft, events };
}

function heroesAct(
  draft: BattleDraft,
  dt: number,
  party: PartyState,
  roster: Roster,
  events: BattleEvent[],
): void {
  const vitals = partyVitals(party, roster);
  const renown = renownPower(party.renown ?? 0);

  for (const slot of party.heroes) {
    const hero = heroById(roster, slot.heroId);
    let cooldown = (draft.cooldowns[hero.id] ?? 0) - dt;

    while (cooldown <= 0 && frontFoe(draft) !== -1) {
      if (hero.role === HeroRole.Healer) {
        const amount = heroHeal(hero, slot.level, vitals);

        draft.partyHp = Math.min(vitals.hp, draft.partyHp + amount);
        events.push({ type: BattleEventType.Heal, source: hero.id, amount });
      } else {
        const [roll, seed] = nextRandom(draft.seed);

        draft.seed = seed;
        const power = safeAmount(heroDamage(hero, slot.level) * renown);
        const crit = roll < BALANCE.critChance;
        const amount = crit ? safeAmount(power * BALANCE.critMultiplier) : power;

        damageFront(draft, amount, events, (foe) => ({
          type: BattleEventType.Hit,
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
      events.push({ type: BattleEventType.PartyHit, foe: index, amount: foe.damage });
      foe.attackIn += foe.attackInterval;
    }
  });
}

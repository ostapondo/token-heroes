import { BALANCE } from '../balance';
import { healShare, heroAttack, heroHeal, safeAmount } from '../formulas';
import { partyVitals, renownPower } from '../party';
import { nextRandom } from '../random';
import { heroById } from '../roster';
import { statusesAct } from '../skills/status';
import { absorb, guard } from '../skills/guard';
import { afterHeroHit, holdsAttack, skillsAct } from '../skills/tick';
import {
  type BattleEvent,
  BattleEventType,
  BattlePhase,
  type BattleState,
  type BattleStep,
  HeroRole,
  type PartyState,
  type Roster,
} from '../types';
import {
  draftOf,
  foesDamagePerSecond,
  frontFoe,
  settleClear,
  wipe,
  type BattleDraft,
} from './draft';
import { heroHit, stealContext, throttled } from './mechanics';
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

  if (!throttled(draft, dt, events)) {
    heroesAct(draft, dt, party, roster, events);
    skillsAct(draft, dt, { party, roster, events });
  }
  statusesAct(draft, dt, events);
  if (settleClear(draft, events)) return { battle: draft, events };

  foesAct(draft, dt, { party, roster, events });
  if (draft.partyHp <= 0) wipe(draft, events);

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

    if (holdsAttack(draft, hero, slot.level)) {
      draft.cooldowns[hero.id] = Math.max(cooldown, 0);
      continue;
    }

    while (cooldown <= 0 && frontFoe(draft) !== -1) {
      if (hero.role === HeroRole.Healer) {
        const amount = safeAmount(
          heroHeal(hero, slot.level, vitals, foesDamagePerSecond(draft)) *
            healShare(hero, slot.level),
        );

        draft.partyHp = Math.min(vitals.hp, draft.partyHp + amount);
        events.push({ type: BattleEventType.Heal, source: hero.id, amount });
      } else {
        const [roll, seed] = nextRandom(draft.seed);

        draft.seed = seed;
        const power = safeAmount(heroAttack(hero, slot.level) * renown);

        heroHit(draft, power, roll < BALANCE.critChance, events, (foe, amount, crit) =>
          events.push({ type: BattleEventType.Hit, source: hero.id, foe, amount, crit }),
        );
        afterHeroHit(draft, hero.id, { party, roster, events });
      }
      cooldown += hero.attackInterval;
    }
    draft.cooldowns[hero.id] = Math.max(cooldown, 0);
  }
}

interface FightContext {
  readonly party: PartyState;
  readonly roster: Roster;
  readonly events: BattleEvent[];
}

// A foe's blow may miss on a hero's guard; a party shield takes what it can of the rest.
function foesAct(draft: BattleDraft, dt: number, context: FightContext): void {
  const { events } = context;

  draft.foes.forEach((foe, index) => {
    if (foe.hp <= 0) return;
    foe.attackIn -= dt;
    while (foe.attackIn <= 0 && foe.hp > 0) {
      foe.attackIn += foe.attackInterval;
      const guarded = guard(draft, index, foe.damage, context);

      if (guarded >= foe.damage) continue;
      const blocked = guarded + absorb(draft, foe.damage - guarded);

      draft.partyHp -= foe.damage - blocked;
      events.push({
        type: BattleEventType.PartyHit,
        foe: index,
        amount: foe.damage - blocked,
        ...(blocked > 0 ? { blocked } : {}),
      });
      stealContext(draft, foe, index, events);
    }
  });
}

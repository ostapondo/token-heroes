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
import { isUp, joinVitals, mendWeakest, partyDown, victims, wound } from './vitals';

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
  joinVitals(draft, party, roster);

  if (!throttled(draft, dt, events)) {
    heroesAct(draft, dt, party, roster, events);
    skillsAct(draft, dt, { party, roster, events });
  }
  statusesAct(draft, dt, events);
  if (settleClear(draft, events)) return { battle: draft, events };

  foesAct(draft, dt, { party, roster, events });
  if (partyDown(draft, party)) wipe(draft, events);

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

    // A hero who is down neither strikes nor heals until it stands again.
    if (!isUp(draft, hero.id) || holdsAttack(draft, hero, slot.level)) {
      draft.cooldowns[hero.id] = Math.max(cooldown, 0);
      continue;
    }

    while (cooldown <= 0 && frontFoe(draft) !== -1) {
      if (hero.role === HeroRole.Healer) {
        const amount = safeAmount(
          heroHeal(hero, slot.level, vitals, foesDamagePerSecond(draft)) *
            healShare(hero, slot.level),
        );

        const target = mendWeakest(draft, party, roster, amount);

        events.push({
          type: BattleEventType.Heal,
          source: hero.id,
          amount,
          ...(target ? { hero: target } : {}),
        });
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

// A foe's blow may miss on a hero's guard; a party shield takes what it can of the rest, and what
// gets through is shared between the heroes the blow reaches.
function foesAct(draft: BattleDraft, dt: number, context: FightContext): void {
  const { events, party } = context;

  draft.foes.forEach((foe, index) => {
    if (foe.hp <= 0) return;
    foe.attackIn -= dt;
    while (foe.attackIn <= 0 && foe.hp > 0) {
      foe.attackIn += foe.attackInterval;
      const guarded = guard(draft, index, foe.damage, context);

      if (guarded >= foe.damage) continue;
      const blocked = guarded + absorb(draft, foe.damage - guarded);
      const struck = victims(draft, party, index, foe);
      const part = 1 / Math.max(1, struck.length);

      for (const hero of struck) {
        events.push({
          type: BattleEventType.PartyHit,
          foe: index,
          hero,
          amount: (foe.damage - blocked) * part,
          ...(blocked > 0 ? { blocked: blocked * part } : {}),
        });
        wound(draft, hero, (foe.damage - blocked) * part, index, events);
      }
      stealContext(draft, foe, index, events);
    }
  });
}

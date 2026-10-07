import type { BattleDraft, FoeDraft } from '../battle/draft';
import { damageAt } from '../battle/mechanics';
import { type BattleEvent, BattleEventType } from '../types';
import { BALANCE } from '../balance';

function burn(draft: BattleDraft, foe: FoeDraft, index: number, dt: number, events: BattleEvent[]) {
  const current = foe.burn;

  if (!current) return;
  let tickIn = current.tickIn - dt;
  const left = current.left - dt;

  while (tickIn <= 0 && foe.hp > 0) {
    damageAt(draft, index, current.perSecond * BALANCE.skills.burnTick, events, (target, amount) =>
      events.push({
        type: BattleEventType.SkillTick,
        source: current.source,
        skill: current.skill,
        foe: target,
        amount,
      }),
    );
    tickIn += BALANCE.skills.burnTick;
  }
  foe.burn = left > 0 && foe.hp > 0 ? { ...current, left, tickIn } : undefined;
}

// Burns tick, marks and stuns wear off and the party's shield fades, even while a foe throttles
// the party's attacks.
export function statusesAct(draft: BattleDraft, dt: number, events: BattleEvent[]): void {
  draft.foes.forEach((foe, index) => {
    if (foe.hp <= 0) return;
    burn(draft, foe, index, dt, events);
    if (foe.mark)
      foe.mark = foe.mark.left > dt ? { ...foe.mark, left: foe.mark.left - dt } : undefined;
    if (foe.stunned !== undefined) foe.stunned = foe.stunned > dt ? foe.stunned - dt : undefined;
  });
  const shield = draft.shield;

  if (shield) draft.shield = shield.left > dt ? { ...shield, left: shield.left - dt } : undefined;
}

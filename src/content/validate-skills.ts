import { SkillEffectKind, SkillTrigger } from '@engine';
import { colorProblems, duplicated, idsOf, spriteProblems } from './checks';
import type { SkillDef } from './model/skill';
import type { Content } from './registry';

const SHARE_TOLERANCE = 1e-9;
const ICON_SIZE = 12;
const MAX_CHANCE = 0.5;

function triggerProblems(skill: SkillDef): string[] {
  const owner = `skill ${skill.id}`;
  const deflects = skill.effects.some((effect) => effect.kind === SkillEffectKind.Deflect);

  return [
    ...(skill.trigger === SkillTrigger.Cooldown && !((skill.cooldown ?? 0) > 0)
      ? [`${owner} fires on a timer but has no positive cooldown`]
      : []),
    ...(skill.trigger !== SkillTrigger.Cooldown &&
    !((skill.chance ?? 0) > 0 && (skill.chance ?? 0) <= MAX_CHANCE)
      ? [`${owner} procs but its chance is not above 0 and at most ${MAX_CHANCE}`]
      : []),
    ...(deflects && skill.trigger !== SkillTrigger.OnGuard
      ? [`${owner} deflects but does not fire on a foe's blow`]
      : []),
    ...((skill.charge ?? 0) >= (skill.cooldown ?? Infinity)
      ? [`${owner} charges for longer than its cooldown`]
      : []),
  ];
}

// The effects spend the hero's budget, so their shares add up to all of it.
function shareProblems(skill: SkillDef): string[] {
  const shares = skill.effects.flatMap((effect) => ('share' in effect ? [effect.share] : []));
  const total = shares.reduce((sum, share) => sum + share, 0);

  return [
    ...(shares.every((share) => share > 0)
      ? []
      : [`skill ${skill.id} has an effect with no share`]),
    ...(Math.abs(total - 1) <= SHARE_TOLERANCE
      ? []
      : [`skill ${skill.id} effects share ${total} of the budget, not all of it`]),
  ];
}

// Every hero opens a first skill; a hero's skills take the slots one, two and so on.
function slotProblems(content: Content): string[] {
  return content.heroes.flatMap((hero) => {
    const slots = content.skills
      .filter((skill) => skill.hero === hero.id)
      .map((skill) => skill.slot)
      .toSorted((left, right) => left - right);

    return slots.length > 0 && slots.every((slot, index) => slot === index + 1)
      ? []
      : [`hero ${hero.id} skills take the slots ${slots.join(', ') || 'none'}, not 1 to n`];
  });
}

export function skillProblems(content: Content): string[] {
  const heroes = new Set(idsOf(content.heroes));

  return [
    ...duplicated('skill', idsOf(content.skills)),
    ...content.skills.flatMap((skill) => [
      ...(heroes.has(skill.hero)
        ? []
        : [`skill ${skill.id} belongs to unknown hero ${skill.hero}`]),
      ...triggerProblems(skill),
      ...shareProblems(skill),
      ...colorProblems(`skill ${skill.id}`, { color: skill.color }),
      ...spriteProblems(`skill ${skill.id} icon`, skill.icon, false),
      ...(skill.icon.rows.length === ICON_SIZE && skill.icon.rows[0]?.length === ICON_SIZE
        ? []
        : [`skill ${skill.id} icon is not ${ICON_SIZE}x${ICON_SIZE}`]),
    ]),
    ...slotProblems(content),
  ];
}

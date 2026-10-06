export const ElementId = {
  Fire: 'fire',
  Ice: 'ice',
  Earth: 'earth',
  Storm: 'storm',
  Venom: 'venom',
  Bone: 'bone',
  Blood: 'blood',
  Gold: 'gold',
  Shadow: 'shadow',
} as const;
export type ElementId = (typeof ElementId)[keyof typeof ElementId];

export const CreatureId = {
  Dragon: 'dragon',
  Demon: 'demon',
  Golem: 'golem',
  Knight: 'knight',
  Zombie: 'zombie',
  Spider: 'spider',
  Wraith: 'wraith',
  Slime: 'slime',
} as const;
export type CreatureId = (typeof CreatureId)[keyof typeof CreatureId];

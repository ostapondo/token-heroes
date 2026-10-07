export const BALANCE = {
  bossEvery: 5,
  packSize: { first: 3, max: 6, growEvery: 10 },
  respawnDelay: 10,
  advanceDelay: 1.5,
  openingCooldown: 0.3,
  openingStagger: 0.2,
  packAttackStagger: 0.15,

  critChance: 0.1,
  critMultiplier: 2.5,
  strikeShare: 0.5,
  strikeCooldown: 0.15,
  // An ultimate is a burst worth under ten seconds of the party's damage, earned by about an
  // hour of agent work, so it rescues a close fight without skipping the wall.
  ultimateMultiplier: 7,
  tokensPerUltimate: 1_000_000,

  // Foes grow alike in health and damage, so a fight at stage 300 asks what one at stage 30 did.
  foeGrowth: 1.07,
  enemyHpBase: 10,
  enemyDamageBase: 0.15,
  bossHpMultiplier: 22,
  // A super boss stands where the boss would on every 50th stage, a stronger one on every 100th.
  // It fights like a boss as many stages deeper as its leads average, so the wall moves onto it
  // and the stages it skips go by quickly. More of the lead is health, so the fight lasts longer.
  superBosses: {
    medium: { every: 50, hpLead: 7, damageLead: 3 },
    strong: { every: 100, hpLead: 14, damageLead: 6 },
  },
  // A super boss mechanic makes the fight harder by a factor its numbers give, and the boss
  // gives up that much health, so its lead alone decides where the wall stands.
  mechanics: {
    stealContext: { share: 0.1 },
    hallucinate: { share: 0.25 },
    inject: { share: 0.125 },
    throttle: { every: 8, pause: 1.5 },
    loop: { at: 0.25, back: 0.5 },
    unmask: { at: 0.5, damage: 1.5 },
    maximize: { kept: 0.8 },
  },
  bossDamageBase: 1.2,
  enemyAttackInterval: 1.6,
  bossAttackInterval: 2.5,

  levelCostBase: 200_000,
  levelCostGrowth: 1.07,
  milestoneEvery: 25,
  milestoneMultiplier: 4,

  // A hero's place in the roster sets its strength, price and unlock, so a new hero slots in
  // after the last one without hand-tuned numbers. Each is stronger per coin than the one before.
  heroRankGrowth: 1.12,
  heroFocusLimit: 0.5,
  starterHeroes: 5,
  hireCostFirst: 300_000,
  hireCostGrowth: 2.2,
  unlockFirst: 50_000_000,
  unlockGrowth: 2,
  roles: {
    striker: { damagePerSecond: 5, hp: 15 },
    tank: { damagePerSecond: 1.2, hp: 55 },
    healer: { damagePerSecond: 0, hp: 16 },
  },
  // Each point of healer power at the party's level makes the party last mendShare longer
  // against the foes' damage; see partyMend.
  mendShare: 0.25,
  healLevelFactor: { min: 0, max: 1.5 },

  // Ascending starts the game over: every hero back to level 1, the party back to stage 1, with
  // power from the deepest stage reached over the base stage. Levels bought with tokens are not
  // refunded, so the power must pay them back within a fraction of the tokens they took. The
  // first ascension opens at minStage and each next one a quarter deeper, so it stays rare.
  ascension: { minStage: 100, depthStep: 1.25, baseStage: 50, exponent: 2 },

  offlineCapSeconds: 8 * 60 * 60,
  offlineStepSeconds: 1,
} as const;

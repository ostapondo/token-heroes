export const BALANCE = {
  bossEvery: 5,
  packSize: { first: 3, max: 6, growEvery: 10 },
  bossTimeLimit: 30,
  respawnDelay: 10,
  advanceDelay: 1.5,
  openingCooldown: 0.3,
  openingStagger: 0.2,
  packAttackStagger: 0.15,

  critChance: 0.1,
  critMultiplier: 2.5,
  strikeShare: 0.5,
  strikeCooldown: 0.15,
  ultimateMultiplier: 25,
  tokensPerUltimate: 50_000,

  // Foes grow alike in health and damage, so a fight at stage 300 asks what one at stage 30 did.
  foeGrowth: 1.07,
  enemyHpBase: 10,
  enemyDamageBase: 0.15,
  bossHpMultiplier: 10,
  bossDamageBase: 1,
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
  // The share of the party's health a first-rank healer restores each second at the party's
  // level; a healer behind or ahead of the party heals less or more, within these bounds.
  healShare: 0.02,
  healLevelFactor: { min: 0.5, max: 1.5 },

  offlineCapSeconds: 8 * 60 * 60,
  offlineStepSeconds: 1,
} as const;

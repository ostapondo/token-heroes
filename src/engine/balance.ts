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
  healerShare: 0.6,

  enemyHpBase: 10,
  bossHpMultiplier: 10,
  hpGrowth: 1.15,
  enemyDamageBase: 0.5,
  bossDamageBase: 6,
  damageGrowth: 1.13,
  enemyAttackInterval: 1.6,
  bossAttackInterval: 2.5,

  levelCostGrowth: 1.07,
  milestoneEvery: 25,
  milestoneMultiplier: 2,

  offlineCapSeconds: 8 * 60 * 60,
  offlineStepSeconds: 1,
} as const;

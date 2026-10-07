type ValueOf<T> = T[keyof T];

// When a skill fires: on its own timer, on one of its hero's hits, or when a foe attacks.
export const SkillTrigger = { Cooldown: 'cooldown', OnHit: 'on-hit', OnGuard: 'on-guard' } as const;
export type SkillTrigger = ValueOf<typeof SkillTrigger>;

export const SkillEffectKind = {
  Hit: 'hit',
  Burn: 'burn',
  Stun: 'stun',
  Mark: 'mark',
  Shield: 'shield',
  Heal: 'heal',
  Deflect: 'deflect',
} as const;
export type SkillEffectKind = ValueOf<typeof SkillEffectKind>;

// A number that changes with the skill's form: at rank I, from rank III and from rank V.
export type Tiered = number | readonly [first: number, third: number, fifth: number];

interface Reaching {
  // Foes struck besides the front one, which in a boss fight is no one.
  readonly reach?: Tiered;
}

// Every effect but the deflect spends a share of the skill's budget; the shares add up to one.
export type SkillEffect =
  | (Reaching & {
      readonly kind: typeof SkillEffectKind.Hit;
      readonly share: number;
      readonly spread?: number;
    })
  | (Reaching & {
      readonly kind: typeof SkillEffectKind.Burn;
      readonly share: number;
      readonly seconds: number;
    })
  | (Reaching & { readonly kind: typeof SkillEffectKind.Stun; readonly share: number })
  | (Reaching & {
      readonly kind: typeof SkillEffectKind.Mark;
      readonly share: number;
      readonly seconds: number;
    })
  | {
      readonly kind: typeof SkillEffectKind.Shield;
      readonly share: number;
      readonly seconds: Tiered;
    }
  | { readonly kind: typeof SkillEffectKind.Heal; readonly share: number }
  | { readonly kind: typeof SkillEffectKind.Deflect };

export interface SkillBlueprint {
  readonly id: string;
  readonly hero: string;
  readonly slot: number;
  readonly trigger: SkillTrigger;
  // Seconds between casts on a timer, or the nominal chance of a proc.
  readonly cooldown?: number;
  readonly chance?: number;
  // Seconds before a cast the hero holds its own attack, which the cast then carries.
  readonly charge?: number;
  readonly effects: readonly SkillEffect[];
}

export interface SkillStats extends SkillBlueprint {
  // Of a hero's skills, this one ranks this many levels behind the first.
  readonly lag: number;
  // The pseudo-random constant that gives the nominal chance on average.
  readonly prd: number;
}

export interface SkillState {
  readonly readyIn: number;
  // Budget gathered since the last cast; a cast spends all of it.
  readonly pool: number;
  // Rolls since the last proc, which raise the next roll's chance.
  readonly misses: number;
}

export interface FoeBurn {
  readonly left: number;
  readonly perSecond: number;
  readonly tickIn: number;
  readonly source: string;
  readonly skill: string;
}

export interface FoeMark {
  readonly left: number;
  readonly bonus: number;
}

export interface PartyShield {
  readonly amount: number;
  readonly left: number;
  readonly skill: string;
}

export interface SkillHit {
  readonly foe: number;
  readonly amount: number;
}

// What a cast did, for the arena to draw and the balance tools to count.
export interface SkillOutcome {
  readonly hits: readonly SkillHit[];
  readonly stun?: number;
  readonly mark?: number;
  readonly shield?: number;
  readonly heal?: number;
  readonly deflected?: number;
  readonly parried?: number;
}

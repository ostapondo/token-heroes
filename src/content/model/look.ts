import type { PALETTE_SLOTS } from './sprite';

type Hex = `#${string}`;
type PaletteSlot = (typeof PALETTE_SLOTS)[number];

// A colour is a palette slot the stage's element fills in, one colour whose shade is derived, or a
// lit colour with its shade.
export type Paint = PaletteSlot | Hex | readonly [lit: Hex, shade: Hex];

// Proportions of the two-legged rig in design units; the arena draws them 1.3 times as large.
export interface Build {
  readonly scale: number;
  readonly head: number;
  readonly neck: number;
  readonly torso: number;
  readonly upper: number;
  readonly fore: number;
  readonly thigh: number;
  readonly shin: number;
  readonly shoulders: number;
  readonly hips: number;
  readonly arm: number;
  readonly forearm: number;
  readonly leg: number;
  readonly calf: number;
}

// How a body holds its arms between blows.
export const Stance = {
  Guard: 'guard',
  Blade: 'blade',
  Archer: 'archer',
  Caster: 'caster',
  Brawler: 'brawler',
  Stalker: 'stalker',
  Shambler: 'shambler',
  Brute: 'brute',
} as const;
export type Stance = (typeof Stance)[keyof typeof Stance];

interface Face {
  readonly form: 'face';
  readonly skin: Paint;
  readonly eyes?: Paint;
  readonly hair?: Paint;
  readonly beard?: Paint;
  readonly hat?: Hat;
  readonly ears?: Paint;
  readonly nose?: Paint;
  readonly mask?: Paint;
  readonly tusks?: Paint;
  readonly marks?: Paint;
  // A wide smile of teeth in this colour.
  readonly grin?: Paint;
  readonly hood?: Paint;
}

interface Helm {
  readonly form: 'helm';
  readonly metal: Paint;
  readonly shape: 'round' | 'bucket' | 'great';
  readonly visor: Paint;
  readonly plume?: Paint;
  readonly crest?: Paint;
}

export type Head =
  | Face
  | Helm
  | { readonly form: 'cowl'; readonly cloth: Paint; readonly eyes: Paint; readonly mask?: Paint }
  | {
      readonly form: 'skull' | 'rock';
      readonly color: Paint;
      readonly eyes: Paint;
      readonly hat?: Hat;
    };

export type Hat =
  | {
      readonly kind: 'straw' | 'kettle' | 'circlet' | 'antlers' | 'horns' | 'ram';
      readonly color: Paint;
    }
  | { readonly kind: 'wizard' | 'witch' | 'tophat'; readonly color: Paint; readonly band?: Paint }
  | { readonly kind: 'horned'; readonly metal: Paint; readonly horn: Paint };

type Plain =
  | 'belt'
  | 'strap'
  | 'trim'
  | 'ribs'
  | 'beads'
  | 'knives'
  | 'pauldron'
  | 'plate'
  | 'spikes'
  | 'chains'
  | 'skulls'
  | 'stitches'
  | 'clips'
  | 'bowtie';
type Glowing = 'core' | 'emblem' | 'brooch' | 'buckle' | 'crystals' | 'hourglass';

export type Detail =
  | { readonly kind: Plain | 'pouch' | 'necklace' | 'leaves' | 'cracks'; readonly color: Paint }
  | { readonly kind: 'tabard'; readonly color: Paint; readonly emblem?: Paint }
  | { readonly kind: Glowing; readonly color: Paint; readonly glow: Paint }
  | { readonly kind: 'scabbard' | 'book'; readonly color: Paint; readonly trim: Paint };

export type Weapon =
  | { readonly kind: 'sword'; readonly length: number; readonly blade: Paint }
  | { readonly kind: 'axe' | 'cleaver'; readonly blade: Paint }
  // A stop sign on a pole reads 429.
  | { readonly kind: 'dagger' | 'mace' | 'trident' | 'paperclip' | 'stop'; readonly color: Paint }
  | { readonly kind: 'staff'; readonly orb: Paint; readonly glow: Paint; readonly wood: Paint }
  | { readonly kind: 'bow' | 'crossbow'; readonly wood: Paint };

export type Offhand =
  | { readonly kind: 'kite'; readonly color: Paint; readonly emblem: Paint }
  | { readonly kind: 'tower'; readonly rim: Paint; readonly face: Paint; readonly boss: Paint }
  | { readonly kind: 'dagger'; readonly color: Paint }
  | { readonly kind: 'mirror'; readonly frame: Paint; readonly glass: Paint };

// Capes, scarves, hair and sashes: chains pinned to the body that trail its motion.
export interface Cloth {
  readonly at: 'back' | 'neck' | 'head' | 'waist';
  readonly length: number;
  readonly width: number;
  readonly color: Paint;
  readonly taper?: number;
  readonly ragged?: true;
}

type Part = 'upper' | 'fore' | 'hand' | 'thigh' | 'shin' | 'boot' | 'torso';

interface Body {
  // How far a blow throws it: a goblin weighs 0.7, a hero about 1, a boss 5 to 7.
  readonly mass: number;
  // Metal sheds sparks when struck; flesh, bone and stone shed chips of their own colour.
  readonly metal?: true;
}

export interface BipedLook extends Body {
  readonly rig: 'biped';
  readonly build?: Partial<Build>;
  readonly stance: Stance;
  readonly colors: Readonly<Record<Part, Paint>>;
  readonly head: Head;
  readonly details?: readonly Detail[];
  readonly weapon?: Weapon;
  readonly offhand?: Offhand;
  readonly robe?: Paint;
  readonly quiver?: Paint;
  readonly wings?: Paint;
  readonly cloth?: readonly Cloth[];
  // Fists wider than the forearm, for golems and brawlers.
  readonly fist?: number;
  // Claws, a stone fist or finger bones in place of a plain fist.
  readonly hands?: 'claws' | 'rock' | 'bones';
  // A tail from the hips with a spade at its tip.
  readonly tail?: Paint;
}

export const BeastForm = {
  Wolf: 'wolf',
  Boar: 'boar',
  Rat: 'rat',
  Dragon: 'dragon',
  Spider: 'spider',
  Scorpion: 'scorpion',
  Beetle: 'beetle',
  Serpent: 'serpent',
  Bat: 'bat',
  Crow: 'crow',
  Ghost: 'ghost',
  Eye: 'eye',
  Skull: 'skull',
  Wraith: 'wraith',
  Slime: 'slime',
  Mushroom: 'mushroom',
  Toad: 'toad',
  Mimic: 'mimic',
  Shoggoth: 'shoggoth',
} as const;
export type BeastForm = (typeof BeastForm)[keyof typeof BeastForm];

// Bodies that are not two-legged: each form brings its own rig, proportions and way of moving.
export interface BeastLook extends Body {
  readonly rig: 'beast';
  readonly form: BeastForm;
  readonly scale?: number;
  readonly crown?: Paint;
  // Runes that glow along the body.
  readonly marks?: Paint;
  // A syringe strapped to the body, its fluid in this colour.
  readonly needle?: Paint;
  // A lantern hung at the waist, glowing in this colour.
  readonly lantern?: Paint;
}

export type Look = BipedLook | BeastLook;

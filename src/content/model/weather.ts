export const PARTICLE_PRESETS = [
  'embers',
  'snow',
  'rocks',
  'rain',
  'drips',
  'wisps',
  'ash',
  'coins',
  'motes',
] as const;
export type ParticlePreset = (typeof PARTICLE_PRESETS)[number];

export type WeatherDef =
  | { readonly kind: 'particles'; readonly preset: ParticlePreset }
  | { readonly kind: 'glow'; readonly color: string }
  | { readonly kind: 'fog'; readonly color: string }
  | { readonly kind: 'pulse'; readonly color: string }
  | { readonly kind: 'lava-floor' }
  | { readonly kind: 'frost-edges' }
  | { readonly kind: 'lightning' }
  | { readonly kind: 'summoning-ring' }
  | { readonly kind: 'ghost-flames' };

export type WeatherKind = WeatherDef['kind'];

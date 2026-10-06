export const ParticlePreset = {
  Embers: 'embers',
  Snow: 'snow',
  Rocks: 'rocks',
  Rain: 'rain',
  Drips: 'drips',
  Wisps: 'wisps',
  Ash: 'ash',
  Coins: 'coins',
  Motes: 'motes',
} as const;
export type ParticlePreset = (typeof ParticlePreset)[keyof typeof ParticlePreset];

export const WeatherKind = {
  Particles: 'particles',
  Glow: 'glow',
  Fog: 'fog',
  Pulse: 'pulse',
  LavaFloor: 'lava-floor',
  FrostEdges: 'frost-edges',
  Lightning: 'lightning',
  SummoningRing: 'summoning-ring',
  GhostFlames: 'ghost-flames',
} as const;
export type WeatherKind = (typeof WeatherKind)[keyof typeof WeatherKind];

type Tinted = { readonly color: string };

export type WeatherDef =
  | { readonly kind: typeof WeatherKind.Particles; readonly preset: ParticlePreset }
  | ({ readonly kind: typeof WeatherKind.Glow } & Tinted)
  | ({ readonly kind: typeof WeatherKind.Fog } & Tinted)
  | ({ readonly kind: typeof WeatherKind.Pulse } & Tinted)
  | { readonly kind: typeof WeatherKind.LavaFloor }
  | { readonly kind: typeof WeatherKind.FrostEdges }
  | { readonly kind: typeof WeatherKind.Lightning }
  | { readonly kind: typeof WeatherKind.SummoningRing }
  | { readonly kind: typeof WeatherKind.GhostFlames };

import { defineLair } from '../model/definitions';
import { LairId } from '../model/ids';
import { PoolMotion, SceneryKind } from '../model/scenery';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineLair({
  id: LairId.Abyss,
  name: 'Abyss',
  status: 'MADDENED',
  palette: { a: '#2e5a5a', b: '#1a3434', c: '#7ab0a0', e: '#ffd84a', h: '#e8f0d0', x: '#050c0c' },
  accent: '#ffd84a',
  backdrop: {
    seed: 79,
    sky: ['#030808', '#0a1a1a', '#142c2c', '#204040', '#305a54'],
    ground: ['#3a5a52', '#2e4a44', '#243c38', '#1a2e2a'],
    scenery: [
      {
        kind: SceneryKind.Overcast,
        body: '#081414',
        rim: '#2a4a46',
        shade: '#102222',
        curtain: '#2a4a44',
      },
      {
        kind: SceneryKind.Orb,
        halos: [
          [16, 36, '#1a3434', 1],
          [15, 26, '#3a5a40', 0.9],
          [14, 20, '#7a7a40', 0.7],
        ],
        corona: { color: '#ffd84a', glint: '#fff3c4' },
        discs: [
          [14, '#e8d888', 0, 0],
          [12, '#fff0b0', -1, -1],
        ],
      },
      {
        kind: SceneryKind.Peaks,
        peaks: [
          [10, 34, 1.4],
          [44, 22, 1.6],
          [170, 30, 1.3],
        ],
        color: '#081414',
        rim: '#2a4a46',
      },
      {
        kind: SceneryKind.Ridge,
        base: 6,
        amplitude: 8,
        roughness: 0.6,
        color: '#0c1c1c',
        rim: '#3a6a60',
      },
      {
        kind: SceneryKind.Pools,
        count: 7,
        size: 13,
        minDepth: 0.2,
        fill: '#1a3434',
        rim: '#3a6a60',
        shine: '#ffd84a',
        motion: { kind: PoolMotion.Ripples, color: '#7ab0a0' },
      },
      { kind: SceneryKind.Reflection, color: '#ffd84a' },
    ],
  },
  weather: [
    { kind: WeatherKind.Fog, color: '#7ab0a0' },
    { kind: WeatherKind.Lightning },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Rain },
  ],
});

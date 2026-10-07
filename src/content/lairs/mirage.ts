import { defineLair } from '../model/definitions';
import { LairId } from '../model/ids';
import { LitterShape, PoolMotion, SceneryKind } from '../model/scenery';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineLair({
  id: LairId.Mirage,
  name: 'Mirage',
  status: 'HALLUCINATING',
  palette: { a: '#c04ad8', b: '#7a2a9a', c: '#ffb0ff', e: '#5ef0ff', h: '#ffffff', x: '#1a0830' },
  accent: '#5ef0ff',
  backdrop: {
    seed: 59,
    sky: ['#12041e', '#2a0a3e', '#4a1660', '#6a2a80', '#7a4aa0'],
    ground: ['#9a6ac8', '#7e56aa', '#64448c', '#4c3470'],
    scenery: [
      {
        kind: SceneryKind.Aurora,
        ribbons: [
          [24, '#ff7ad8', 0.3],
          [40, '#5ef0ff', -0.2],
        ],
      },
      {
        kind: SceneryKind.Orb,
        halos: [
          [14, 32, '#4a1660', 1],
          [14, 22, '#8a3aa8', 0.8],
        ],
        corona: { color: '#5ef0ff', glint: '#ffffff' },
        discs: [
          [13, '#f4e8ff', 0, 0],
          [7, '#5ef0ff', -2, 0],
          [4, '#12041e', -3, 0],
        ],
      },
      {
        kind: SceneryKind.Shards,
        shards: [
          [8, 26, 5],
          [20, 16, 3],
          [34, 22, 4],
          [120, 14, 3],
          [160, 24, 5],
          [178, 14, 3],
        ],
        lit: '#6a2a80',
        shade: '#3a1450',
        edge: '#ff7ad8',
        tip: '#5ef0ff',
      },
      { kind: SceneryKind.HorizonLine, color: '#ffb0ff' },
      {
        kind: SceneryKind.Pools,
        count: 7,
        size: 12,
        minDepth: 0.2,
        fill: '#3a6ab0',
        rim: '#5ef0ff',
        shine: '#ffffff',
        motion: { kind: PoolMotion.Ripples, color: '#ffb0ff' },
      },
      { kind: SceneryKind.Reflection, color: '#ff7ad8' },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Sparkle,
        count: 20,
        minDepth: 0.1,
        colors: ['#5ef0ff', '#ff7ad8'],
      },
    ],
  },
  weather: [
    { kind: WeatherKind.Pulse, color: '#c04ad8' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Wisps },
  ],
});

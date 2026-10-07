import { defineLair } from '../model/definitions';
import { LairId } from '../model/ids';
import { LitterShape, PoolMotion, SceneryKind } from '../model/scenery';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineLair({
  id: LairId.Mire,
  name: 'Mire',
  status: 'INJECTED',
  palette: { a: '#4a6a3a', b: '#2a4020', c: '#a8d878', e: '#ff3b5c', h: '#e8eef4', x: '#0a1408' },
  accent: '#5dff8a',
  backdrop: {
    seed: 61,
    sky: ['#020806', '#06120c', '#0c2014', '#16321e', '#24482a'],
    ground: ['#3a5a36', '#2e4a2c', '#253e24', '#1c321c'],
    scenery: [
      {
        kind: SceneryKind.Orb,
        lift: -6,
        halos: [[10, 24, '#1c3a22', 0.9]],
        discs: [
          [10, '#a8f0b0', 0, 0],
          [8, '#d8ffd8', -1, -1],
        ],
      },
      { kind: SceneryKind.Canopy, color: '#1a3020', rim: '#2a4a30' },
      {
        kind: SceneryKind.Trees,
        trees: [
          [10, 40],
          [44, 30],
          [96, 24],
          [178, 44],
        ],
        color: '#16281a',
        moss: '#2a5a32',
      },
      {
        kind: SceneryKind.Fence,
        from: 120,
        to: 185,
        step: 7,
        height: 12,
        rails: [],
        color: '#9aa8b4',
        tip: '#e8eef4',
        spear: true,
      },
      {
        kind: SceneryKind.Pools,
        count: 7,
        size: 11,
        minDepth: 0.2,
        fill: '#1fa850',
        rim: '#5dff8a',
        shine: '#d8ffd8',
        motion: { kind: PoolMotion.Bubbles, color: '#5dff8a' },
      },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Reed,
        count: 26,
        minDepth: 0.15,
        colors: ['#2e4a14', '#4a6a3a'],
      },
    ],
  },
  weather: [
    { kind: WeatherKind.Fog, color: '#5dff8a' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Drips },
  ],
});

import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { LitterShape, PoolMotion, SceneryKind } from '../model/scenery';
import { DeathKind } from '../model/death';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Venom,
  name: 'Venom',
  status: 'POISONED',
  palette: { a: '#5b8a24', b: '#33521a', c: '#c7d94a', e: '#e2e86a', h: '#e9e2cc', x: '#142008' },
  accent: '#a6d83d',
  backdrop: {
    seed: 29,
    sky: ['#050803', '#090f05', '#0f1908', '#17260b', '#223912'],
    ground: ['#3a5418', '#2c4014', '#22330f', '#18240b'],
    scenery: [
      {
        kind: SceneryKind.Orb,
        lift: -8,
        halos: [[10, 22, '#2a4012', 0.9]],
        discs: [
          [9, '#a8b83a', 0, 0],
          [7, '#c7d94a', -1, -1],
        ],
        spots: {
          color: '#a8b83a',
          at: [
            [-3, -2, 1],
            [2, 1, 1],
            [-1, 4, 1],
            [4, -4, 1],
          ],
        },
      },
      { kind: SceneryKind.Canopy, color: '#192a0c', rim: '#2a4012' },
      {
        kind: SceneryKind.Trees,
        trees: [
          [14, 44],
          [38, 28],
          [108, 22],
          [168, 40],
        ],
        color: '#090f05',
        moss: '#33521a',
      },
      {
        kind: SceneryKind.Pools,
        count: 6,
        size: 11,
        minDepth: 0.25,
        fill: '#3d6018',
        rim: '#5b8a24',
        shine: '#a6d83d',
        motion: { kind: PoolMotion.Bubbles, color: '#c7d94a' },
      },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Reed,
        count: 26,
        minDepth: 0.15,
        colors: ['#2e4a14', '#5a4428'],
      },
    ],
  },
  death: DeathKind.Melt,
  weather: [
    { kind: WeatherKind.Fog, color: '#a6d83d' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Drips },
  ],
});

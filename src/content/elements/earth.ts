import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { LitterShape, SceneryKind } from '../model/scenery';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Earth,
  name: 'Earth',
  status: 'CRUSHED',
  palette: { a: '#8a6a3a', b: '#5a4428', c: '#a8b85a', e: '#ffb02e', h: '#c9c3b4', x: '#2a1f12' },
  accent: '#c9a05a',
  backdrop: {
    seed: 23,
    sky: ['#120d08', '#1c140b', '#2a1e10', '#3d2c17', '#5a4122'],
    ground: ['#5c4527', '#4a381f', '#3b2c18', '#2c2011'],
    scenery: [
      {
        kind: SceneryKind.Orb,
        halos: [[15, 30, '#4a3620', 0.9]],
        discs: [
          [15, '#8f6a34', 0, 0],
          [12, '#b08440', 0, 0],
        ],
      },
      {
        kind: SceneryKind.Mesas,
        mesas: [
          [-10, 34, 26],
          [66, 104, 33],
          [150, 196, 20],
        ],
        color: '#33261a',
        rim: '#7a5a2e',
        strata: '#3d2e1f',
      },
      {
        kind: SceneryKind.Ridge,
        base: 5,
        amplitude: 12,
        roughness: 0.6,
        color: '#1e150c',
        rim: '#5a4428',
      },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Crack,
        count: 70,
        minDepth: 0.35,
        colors: ['#21170b'],
      },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Pebble,
        count: 46,
        minDepth: 0.05,
        colors: ['#7a5c34', '#b08a4a'],
      },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Tuft,
        count: 16,
        minDepth: 0.4,
        colors: ['#6f7a34', '#a8b85a'],
      },
    ],
  },
  weather: [
    { kind: WeatherKind.Fog, color: '#c9a05a' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Rocks },
  ],
});

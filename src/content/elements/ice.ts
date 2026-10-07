import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { LitterShape, SceneryKind } from '../model/scenery';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Ice,
  name: 'Ice',
  status: 'FROZEN',
  palette: { a: '#4f9fd1', b: '#2a6f9e', c: '#bfeaff', e: '#f2fbff', h: '#e8f7ff', x: '#0b2233' },
  accent: '#8fd8ff',
  backdrop: {
    seed: 5,
    sky: ['#030a12', '#06121e', '#0a1c2e', '#102a44', '#1a4060'],
    ground: ['#7aa4c0', '#6690ae', '#557c99', '#456884'],
    scenery: [
      {
        kind: SceneryKind.Stars,
        count: 44,
        colors: ['#8fb8d0', '#8fb8d0', '#ffffff'],
        below: 70,
        twinkle: 10,
        flash: '#ffffff',
      },
      {
        kind: SceneryKind.Aurora,
        ribbons: [
          [30, '#52e0c4', 0.35],
          [46, '#8fd8ff', -0.25],
        ],
      },
      {
        kind: SceneryKind.Peaks,
        peaks: [
          [16, 30, 1.1],
          [60, 42, 0.95],
          [100, 26, 1.2],
          [146, 38, 1],
          [186, 28, 1.2],
        ],
        color: '#173a56',
        snow: { cap: '#6f9fbf', line: '#a9cde3' },
      },
      {
        kind: SceneryKind.Shards,
        shards: [
          [6, 22, 4],
          [13, 13, 3],
          [26, 17, 3],
          [118, 11, 3],
          [128, 21, 4],
          [137, 10, 2],
          [172, 25, 5],
          [181, 15, 3],
        ],
        lit: '#14324c',
        shade: '#0c2236',
        edge: '#3f7aa6',
        tip: '#bfeaff',
      },
      { kind: SceneryKind.HorizonLine, color: '#a9cde3' },
      {
        kind: SceneryKind.Furrows,
        rows: 9,
        wave: 0.21,
        tighten: 0.12,
        threshold: 0.35,
        color: '#a9cde3',
        shade: '#4a7290',
      },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Sparkle,
        count: 26,
        minDepth: 0.2,
        colors: ['#ffffff'],
      },
    ],
  },
  weather: [
    { kind: WeatherKind.FrostEdges },
    { kind: WeatherKind.Fog, color: '#dff3ff' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Snow },
  ],
});

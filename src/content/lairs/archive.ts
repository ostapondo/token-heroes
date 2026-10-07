import { defineLair } from '../model/definitions';
import { LairId } from '../model/ids';
import { LitterShape, SceneryKind } from '../model/scenery';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineLair({
  id: LairId.Archive,
  name: 'Archive',
  status: 'FORGOTTEN',
  palette: { a: '#4a3c96', b: '#2c2360', c: '#a89ae8', e: '#ffd36a', h: '#d8d0f0', x: '#0d0a1f' },
  accent: '#ffd36a',
  backdrop: {
    seed: 53,
    sky: ['#07061a', '#120e2e', '#201a48', '#2e2562', '#3e3478'],
    ground: ['#5a4ea0', '#4a4088', '#3c3470', '#2e285a'],
    scenery: [
      {
        kind: SceneryKind.Stars,
        count: 50,
        colors: ['#5a4a2a', '#c09a4a', '#ffd36a'],
        below: 80,
        twinkle: 14,
        flash: '#fff3c4',
      },
      {
        kind: SceneryKind.Orb,
        halos: [
          [14, 34, '#1c1638', 1],
          [14, 24, '#2e2660', 0.9],
          [13, 18, '#4a3c96', 0.8],
        ],
        corona: { color: '#ffd36a', glint: '#fff3c4' },
        discs: [
          [12, '#ffe9a8', 0, 0],
          [10, '#ffd36a', -1, -1],
        ],
      },
      {
        kind: SceneryKind.Monoliths,
        monoliths: [
          [4, 10, 46],
          [20, 8, 38],
          [40, 10, 52],
          [64, 8, 34],
          [152, 9, 40],
          [172, 12, 50],
        ],
        color: '#221c44',
        rim: '#4a3c96',
        rimFar: '#2c2360',
      },
      { kind: SceneryKind.Colonnade, x: 96, color: '#28214e', cap: '#2c2360', edge: '#6a5ab8' },
      { kind: SceneryKind.HorizonLine, color: '#6a5ab8' },
      { kind: SceneryKind.Flagstones, rows: 8, spacing: 24, joint: '#221c48' },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Sparkle,
        count: 30,
        minDepth: 0.1,
        colors: ['#ffd36a', '#fff3c4'],
      },
    ],
  },
  weather: [
    { kind: WeatherKind.Glow, color: '#ffd36a' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Motes },
  ],
});

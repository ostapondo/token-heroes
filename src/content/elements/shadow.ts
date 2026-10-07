import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { SceneryKind } from '../model/scenery';
import { DeathKind } from '../model/death';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Shadow,
  name: 'Shadow',
  status: 'BLINDED',
  palette: { a: '#2c303a', b: '#16181d', c: '#5a6070', e: '#f2f2f2', h: '#8a90a0', x: '#000000' },
  accent: '#d8dde6',
  backdrop: {
    seed: 3,
    sky: ['#000000', '#05060a', '#11131a', '#1e2129', '#2a2d36'],
    ground: ['#454954', '#373a44', '#2c2f37', '#24262d'],
    pool: 0.35,
    scenery: [
      {
        kind: SceneryKind.Orb,
        halos: [
          [14, 34, '#13161d', 1],
          [14, 24, '#2c303a', 0.9],
          [13, 18, '#5a6070', 0.8],
        ],
        corona: { color: '#d8dde6', glint: '#ffffff' },
        discs: [[12, '#000000', 0, 0]],
      },
      {
        kind: SceneryKind.Monoliths,
        monoliths: [
          [12, 5, 30],
          [34, 4, 22],
          [62, 6, 40],
          [98, 4, 18],
          [118, 5, 26],
          [176, 6, 34],
        ],
        color: '#0b0c10',
        rim: '#2c303a',
        rimFar: '#1a1d24',
      },
      {
        kind: SceneryKind.Ruins,
        ruins: [
          [24, 6, 12],
          [84, 7, 16],
          [158, 6, 10],
        ],
        color: '#040506',
        rim: '#3a3f4a',
      },
      { kind: SceneryKind.Tiles, rows: 7, spacing: 34, line: '#2a2d35' },
      { kind: SceneryKind.Reflection, color: '#5a6070' },
    ],
  },
  death: DeathKind.Sink,
  weather: [
    { kind: WeatherKind.Pulse, color: '#000000' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Motes },
  ],
});

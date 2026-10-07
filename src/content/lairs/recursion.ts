import { defineLair } from '../model/definitions';
import { LairId } from '../model/ids';
import { SceneryKind } from '../model/scenery';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineLair({
  id: LairId.Recursion,
  name: 'Recursion',
  status: 'LOOPING',
  palette: { a: '#3ad06a', b: '#1f8a40', c: '#a8ffb8', e: '#ffe14a', h: '#eef4ee', x: '#08200f' },
  accent: '#3ad06a',
  backdrop: {
    seed: 73,
    sky: ['#010402', '#04140a', '#0a2614', '#123a1e', '#1c522a'],
    ground: ['#1e4a2a', '#1a4024', '#16361e', '#122c18'],
    scenery: [
      {
        kind: SceneryKind.Stars,
        count: 60,
        colors: ['#1f8a40', '#3ad06a', '#a8ffb8'],
        below: 90,
        twinkle: 20,
        flash: '#eef4ee',
      },
      {
        kind: SceneryKind.Orb,
        halos: [
          [14, 30, '#0c2c16', 1],
          [14, 22, '#1a4a26', 0.8],
        ],
        corona: { color: '#3ad06a', glint: '#a8ffb8' },
        discs: [[12, '#010402', 0, 0]],
      },
      { kind: SceneryKind.Colonnade, x: 10, color: '#06140a', cap: '#0e2a16', edge: '#3ad06a' },
      { kind: SceneryKind.Colonnade, x: 120, color: '#06140a', cap: '#0e2a16', edge: '#3ad06a' },
      { kind: SceneryKind.HorizonLine, color: '#a8ffb8' },
      { kind: SceneryKind.Tiles, rows: 9, spacing: 20, line: '#2a7a44', shine: '#3ad06a' },
    ],
  },
  weather: [
    { kind: WeatherKind.Pulse, color: '#3ad06a' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Motes },
  ],
});

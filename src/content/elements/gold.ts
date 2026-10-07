import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { LitterShape, SceneryKind } from '../model/scenery';
import { DeathKind } from '../model/death';
import { ParticlePreset, WeatherKind } from '../model/weather';

const STONE = '#241a07';
const GILT = '#4a3610';

export default defineElement({
  id: ElementId.Gold,
  name: 'Gold',
  status: 'GILDED',
  palette: { a: '#e8a23a', b: '#a8661a', c: '#fff3c4', e: '#ffffff', h: '#dfe3e8', x: '#1a1206' },
  accent: '#ffd36a',
  backdrop: {
    seed: 37,
    sky: ['#0e0a03', '#181105', '#251a08', '#38290c', '#544012'],
    ground: ['#6a5018', '#574114', '#463410', '#33260b'],
    scenery: [
      {
        kind: SceneryKind.Rays,
        color: '#5a4012',
        shafts: [
          [-4, 9],
          [30, 5],
          [58, 11],
        ],
      },
      {
        kind: SceneryKind.Ziggurat,
        x: 12,
        color: '#281d08',
        shade: STONE,
        edge: GILT,
        door: '#1a1206',
      },
      { kind: SceneryKind.Colonnade, x: 116, color: '#21180a', cap: STONE, edge: GILT },
      {
        kind: SceneryKind.Hoard,
        mounds: [
          [6, 22, 10],
          [52, 18, 7],
          [98, 26, 9],
          [150, 30, 13],
          [186, 20, 8],
        ],
        color: GILT,
        rim: '#c08a2a',
        glint: '#fff3c4',
        sparkle: '#ffffff',
      },
      { kind: SceneryKind.Tiles, rows: 7, spacing: 30, line: '#2c2009', shine: '#76591c' },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Coin,
        count: 22,
        minDepth: 0.3,
        colors: ['#ffd36a', '#a8661a'],
      },
    ],
  },
  death: DeathKind.Gold,
  weather: [
    { kind: WeatherKind.Glow, color: '#ffd36a' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Coins },
  ],
});

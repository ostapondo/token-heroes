import { defineLair } from '../model/definitions';
import { LairId } from '../model/ids';
import { LitterShape, SceneryKind } from '../model/scenery';
import { DeathKind } from '../model/death';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineLair({
  id: LairId.Court,
  name: 'Court',
  status: 'FLATTERED',
  palette: { a: '#d84a8a', b: '#8a2a5a', c: '#ffc8dc', e: '#ffd36a', h: '#fff6e0', x: '#2a0a1a' },
  accent: '#ff8ac8',
  backdrop: {
    seed: 67,
    sky: ['#0e0208', '#1e0612', '#340c20', '#4e1430', '#6a2040'],
    ground: ['#8a2440', '#741e36', '#5e182c', '#481222'],
    scenery: [
      {
        kind: SceneryKind.Rays,
        color: '#6a3a20',
        shafts: [
          [-4, 10],
          [40, 6],
          [70, 12],
        ],
      },
      {
        kind: SceneryKind.Cathedral,
        x: 30,
        color: '#1a0610',
        glass: '#4a1428',
        rose: ['#ffd36a', '#ff8ac8'],
      },
      { kind: SceneryKind.Colonnade, x: 112, color: '#2a0c18', cap: '#5a3a14', edge: '#c89020' },
      {
        kind: SceneryKind.Hoard,
        mounds: [
          [8, 18, 8],
          [60, 14, 6],
          [176, 22, 9],
        ],
        color: '#5a3a14',
        rim: '#c89020',
        glint: '#fff3c4',
        sparkle: '#ffffff',
      },
      { kind: SceneryKind.Tiles, rows: 7, spacing: 28, line: '#5e182c', shine: '#c89020' },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Coin,
        count: 18,
        minDepth: 0.3,
        colors: ['#ffd36a', '#ff8ac8'],
      },
    ],
  },
  death: DeathKind.Gold,
  weather: [
    { kind: WeatherKind.Glow, color: '#ff8ac8' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Coins },
  ],
});

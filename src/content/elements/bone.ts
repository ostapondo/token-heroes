import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { LitterShape, SceneryKind } from '../model/scenery';
import { DeathKind } from '../model/death';
import { ParticlePreset, WeatherKind } from '../model/weather';

const GRAVE = '#06100d';
const MOONLIT = '#2f524a';

export default defineElement({
  id: ElementId.Bone,
  name: 'Bone',
  status: 'HAUNTED',
  palette: { a: '#9aa38f', b: '#5c6457', c: '#e9e2cc', e: '#52e0c4', h: '#e9e2cc', x: '#0c1614' },
  accent: '#52e0c4',
  backdrop: {
    seed: 17,
    sky: ['#020605', '#050d0c', '#091715', '#0f221f', '#173430'],
    ground: ['#2a4c42', '#1f3c34', '#172e28', '#10221d'],
    scenery: [
      {
        kind: SceneryKind.Stars,
        count: 38,
        colors: ['#5c6457', '#9aa38f', '#e9e2cc'],
        below: 74,
        twinkle: 12,
        flash: '#e9e2cc',
      },
      {
        kind: SceneryKind.Orb,
        halos: [
          [14, 30, '#173430', 1],
          [14, 20, '#2a4a42', 0.8],
        ],
        discs: [
          [14, '#c9c3b4', 0, 0],
          [12, '#e9e2cc', -1, -1],
        ],
        spots: {
          color: '#c9c3b4',
          at: [
            [-4, -3, 2],
            [3, 2, 1],
            [5, -5, 1],
            [-2, 5, 2],
            [6, 4, 1],
          ],
        },
      },
      { kind: SceneryKind.Ridge, base: 9, amplitude: 8, roughness: 0.5, color: '#10221d' },
      { kind: SceneryKind.Chapel, x: 20, color: '#0d1d18', window: '#52e0c4', door: '#2a6a5c' },
      {
        kind: SceneryKind.Graves,
        tombs: [
          [58, 5, 7],
          [70, 6, 9],
          [100, 5, 6],
          [148, 6, 8],
          [160, 4, 6],
        ],
        crosses: [
          [84, 12],
          [92, 9],
          [136, 11],
          [124, 8],
        ],
        color: GRAVE,
        rim: MOONLIT,
      },
      {
        kind: SceneryKind.Fence,
        from: 106,
        to: 121,
        step: 3,
        height: 7,
        rails: [5],
        color: GRAVE,
        tip: MOONLIT,
      },
      { kind: SceneryKind.Trees, trees: [[178, 36]], color: GRAVE },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Tuft,
        count: 30,
        minDepth: 0.1,
        colors: ['#24453a'],
      },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Bone,
        count: 12,
        minDepth: 0.35,
        colors: ['#9aa38f', '#c9c3b4'],
      },
      {
        kind: SceneryKind.Litter,
        shape: LitterShape.Skull,
        count: 2,
        minDepth: 0.4,
        colors: ['#e9e2cc', GRAVE],
      },
    ],
  },
  death: DeathKind.Bones,
  weather: [
    { kind: WeatherKind.GhostFlames },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Wisps },
  ],
});

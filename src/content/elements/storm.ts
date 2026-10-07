import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { PoolMotion, SceneryKind } from '../model/scenery';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineElement({
  id: ElementId.Storm,
  name: 'Storm',
  status: 'SHOCKED',
  palette: { a: '#2f4c6e', b: '#1b2d44', c: '#c9d6e3', e: '#ffe94a', h: '#e9eef5', x: '#0c1220' },
  accent: '#ffe94a',
  backdrop: {
    seed: 13,
    sky: ['#070a12', '#0b111d', '#111a2b', '#18253b', '#22344f'],
    ground: ['#3a5070', '#2c3f5a', '#223249', '#18243a'],
    scenery: [
      {
        kind: SceneryKind.Overcast,
        body: '#0f1726',
        rim: '#2a4060',
        shade: '#1c2b44',
        curtain: '#2c4566',
      },
      { kind: SceneryKind.Clouds, top: 58, thick: 3, body: '#16223a', lit: '#2f4c6e' },
      {
        kind: SceneryKind.Peaks,
        peaks: [
          [30, 26, 1.6],
          [72, 34, 1.3],
          [104, 20, 1.8],
          [150, 30, 1.4],
          [182, 24, 1.5],
        ],
        color: '#152034',
        rim: '#2f4c6e',
      },
      {
        kind: SceneryKind.Ridge,
        base: 5,
        amplitude: 10,
        roughness: 0.7,
        color: '#0b1220',
        rim: '#3a5a80',
      },
      {
        kind: SceneryKind.Furrows,
        rows: 7,
        wave: 0.17,
        tighten: 0,
        threshold: 0.6,
        color: '#34496a',
      },
      {
        kind: SceneryKind.Pools,
        count: 8,
        size: 10,
        minDepth: 0.25,
        fill: '#33507a',
        rim: '#4f739a',
        shine: '#c9d6e3',
        motion: { kind: PoolMotion.Ripples, color: '#c9d6e3' },
      },
    ],
  },
  weather: [
    { kind: WeatherKind.Lightning },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Rain },
  ],
});

import { defineElement } from '../model/definitions';
import { ElementId } from '../model/ids';
import { SceneryKind } from '../model/scenery';
import { ParticlePreset, WeatherKind } from '../model/weather';

const SPIRE = '#0f0305';

export default defineElement({
  id: ElementId.Blood,
  name: 'Blood',
  status: 'CURSED',
  palette: { a: '#8e0f1a', b: '#4a060c', c: '#ff7a3d', e: '#ffd23f', h: '#e8d9c0', x: '#120406' },
  accent: '#e0252f',
  backdrop: {
    seed: 41,
    sky: ['#080102', '#180407', '#2e070c', '#481014', '#621419'],
    ground: ['#6a161c', '#5e131a', '#521016', '#460d12'],
    scenery: [
      { kind: SceneryKind.Clouds, top: 22, thick: 4, body: '#170407', lit: '#34090e' },
      {
        kind: SceneryKind.Orb,
        halos: [
          [14, 30, '#2a060a', 1],
          [13, 19, '#5a0f14', 0.9],
        ],
        corona: { color: '#e0252f', glint: '#ff7a3d' },
        discs: [[12, '#050102', 0, 0]],
      },
      {
        kind: SceneryKind.Peaks,
        peaks: [
          [8, 22, 1.6],
          [160, 16, 1.5],
          [178, 20, 1.5],
        ],
        color: SPIRE,
      },
      {
        kind: SceneryKind.Cathedral,
        x: 50,
        color: SPIRE,
        glass: '#3a0a0f',
        rose: ['#5a0f14', '#e0252f'],
      },
      {
        kind: SceneryKind.Fence,
        from: 88,
        to: 185,
        step: 5,
        height: 9,
        rails: [6, 2],
        color: '#0b0203',
        tip: '#0b0203',
        spear: true,
      },
      { kind: SceneryKind.Flagstones, rows: 8, spacing: 26, joint: '#480e12' },
      {
        kind: SceneryKind.Pools,
        count: 5,
        size: 9,
        minDepth: 0.3,
        fill: '#4a060c',
        rim: '#8e0f1a',
        shine: '#e0252f',
      },
    ],
  },
  weather: [
    { kind: WeatherKind.SummoningRing },
    { kind: WeatherKind.Pulse, color: '#e0252f' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Ash },
  ],
});

import { defineLair } from '../model/definitions';
import { LairId } from '../model/ids';
import { SceneryKind } from '../model/scenery';
import { DeathKind } from '../model/death';
import { ParticlePreset, WeatherKind } from '../model/weather';

export default defineLair({
  id: LairId.Bastion,
  name: 'Bastion',
  status: 'THROTTLED',
  palette: { a: '#5c6470', b: '#353b45', c: '#a4aeba', e: '#ff3030', h: '#c8a050', x: '#14171c' },
  accent: '#ff3030',
  backdrop: {
    seed: 71,
    sky: ['#08090c', '#141720', '#22262f', '#343844', '#4a3a40'],
    ground: ['#4a505c', '#3c414c', '#30343e', '#24272f'],
    scenery: [
      {
        kind: SceneryKind.Overcast,
        body: '#1c1f28',
        rim: '#3a3f4c',
        shade: '#262a34',
        curtain: '#3a2026',
      },
      {
        kind: SceneryKind.Orb,
        halos: [
          [14, 30, '#2a1418', 1],
          [13, 20, '#5a1a1e', 0.8],
        ],
        corona: { color: '#ff3030', glint: '#ffb0a0' },
        discs: [[11, '#14171c', 0, 0]],
      },
      {
        kind: SceneryKind.Monoliths,
        monoliths: [
          [0, 18, 46],
          [30, 10, 30],
          [52, 14, 40],
          [150, 12, 36],
          [168, 18, 50],
        ],
        color: '#262a32',
        rim: '#5c6470',
        rimFar: '#2a2e36',
      },
      {
        kind: SceneryKind.Fence,
        from: 70,
        to: 140,
        step: 4,
        height: 18,
        rails: [14, 8, 2],
        color: '#0c0d10',
        tip: '#5c6470',
        spear: true,
      },
      { kind: SceneryKind.Flagstones, rows: 8, spacing: 22, joint: '#262a32' },
    ],
  },
  death: DeathKind.Stone,
  weather: [
    { kind: WeatherKind.Pulse, color: '#ff3030' },
    { kind: WeatherKind.Particles, preset: ParticlePreset.Rain },
  ],
});

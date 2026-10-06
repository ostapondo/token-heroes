import { defineElement } from '../model/definitions';

export default defineElement({
  id: 'earth',
  name: 'Earth',
  status: 'CRUSHED',
  palette: { a: '#8a6a3a', b: '#5a4428', c: '#a8b85a', e: '#ffb02e', h: '#c9c3b4', x: '#2a1f12' },
  sky: '#16120c',
  floor: '#3a2c18',
  accent: '#c9a05a',
  weather: [
    { kind: 'fog', color: '#c9a05a' },
    { kind: 'particles', preset: 'rocks' },
  ],
});

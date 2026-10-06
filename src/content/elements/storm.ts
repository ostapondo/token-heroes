import { defineElement } from '../model/definitions';

export default defineElement({
  id: 'storm',
  name: 'Storm',
  status: 'SHOCKED',
  palette: { a: '#2f4c6e', b: '#1b2d44', c: '#c9d6e3', e: '#ffe94a', h: '#e9eef5', x: '#0c1220' },
  sky: '#0b111d',
  floor: '#182436',
  accent: '#ffe94a',
  weather: [{ kind: 'lightning' }, { kind: 'particles', preset: 'rain' }],
});

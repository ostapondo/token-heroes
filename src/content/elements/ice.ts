import { defineElement } from '../model/definitions';

export default defineElement({
  id: 'ice',
  name: 'Ice',
  status: 'FROZEN',
  palette: { a: '#4f9fd1', b: '#2a6f9e', c: '#bfeaff', e: '#f2fbff', h: '#e8f7ff', x: '#0b2233' },
  sky: '#0a1b28',
  floor: '#dff3ff',
  accent: '#8fd8ff',
  weather: [
    { kind: 'frost-edges' },
    { kind: 'fog', color: '#dff3ff' },
    { kind: 'particles', preset: 'snow' },
  ],
});

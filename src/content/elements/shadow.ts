import { defineElement } from '../model/definitions';

export default defineElement({
  id: 'shadow',
  name: 'Shadow',
  status: 'BLINDED',
  palette: { a: '#2c303a', b: '#16181d', c: '#5a6070', e: '#f2f2f2', h: '#8a90a0', x: '#000000' },
  sky: '#050608',
  floor: '#0e1014',
  accent: '#d8dde6',
  weather: [
    { kind: 'pulse', color: '#000000' },
    { kind: 'particles', preset: 'motes' },
  ],
});

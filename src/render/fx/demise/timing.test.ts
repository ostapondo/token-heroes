import { describe, expect, it } from 'vitest';
import { DEMISE, demiseMoment } from './timing';

describe('demiseMoment', () => {
  it('fells the front hero first and each one behind a moment later', () => {
    const at = DEMISE.strike + DEMISE.stagger;

    expect(demiseMoment(at, 0)).toEqual({
      stage: 'dying',
      progress: DEMISE.stagger / DEMISE.dying,
    });
    expect(demiseMoment(at, 1)).toEqual({ stage: 'dying', progress: 0 });
    expect(demiseMoment(at, 2)).toEqual({ stage: 'standing' });
  });

  it('leaves a fallen hero down until the party rises', () => {
    expect(demiseMoment(9, 13)).toEqual({ stage: 'down' });
  });
});

import type { UpdateOffer } from '@platform';
import type { ReleasePhase } from './constants';

export interface ReleaseState {
  readonly offer: UpdateOffer | null;
  readonly phase: ReleasePhase;
}

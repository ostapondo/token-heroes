import { createStore, type StoreApi } from 'zustand/vanilla';
import { ReleasePhase } from '../constants';
import type { ReleaseState } from '../types';

export type ReleaseStore = StoreApi<ReleaseState>;

export function createReleaseStore(): ReleaseStore {
  return createStore<ReleaseState>()(() => ({ offer: null, phase: ReleasePhase.Idle }));
}

export const selectOffer = (state: ReleaseState) => state.offer;
export const selectPhase = (state: ReleaseState) => state.phase;

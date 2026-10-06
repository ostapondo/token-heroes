import { use } from 'react';
import { useStore } from 'zustand';
import type { ReleaseService } from '../session/release-service';
import type { ReleaseState } from '../types';
import { ReleaseContext } from './release-context';

export function useRelease(): ReleaseService {
  const release = use(ReleaseContext);

  if (!release) throw new Error('useRelease needs a ReleaseContext provider');

  return release;
}

export function useReleaseState<Slice>(selector: (state: ReleaseState) => Slice): Slice {
  return useStore(useRelease().store, selector);
}

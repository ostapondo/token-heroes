import { use } from 'react';
import { useStore } from 'zustand';
import type { GameSession } from '../session/game-session';
import type { GameState } from '../types';
import { SessionContext } from './session-context';

export function useSession(): GameSession {
  const session = use(SessionContext);

  if (!session) throw new Error('useSession needs a SessionContext provider');

  return session;
}

export function useGame<Slice>(selector: (state: GameState) => Slice): Slice {
  return useStore(useSession().store, selector);
}

import { createContext } from 'react';
import type { GameSession } from '../session/game-session';

export const SessionContext = createContext<GameSession | null>(null);

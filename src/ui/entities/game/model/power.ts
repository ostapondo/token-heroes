import { renownPower, type GameSave } from '@engine';

export const formatPower = (power: number): string => `×${power.toFixed(1)}`;

export const partyPowerOf = (game: GameSave): number => renownPower(game.party.renown ?? 0);

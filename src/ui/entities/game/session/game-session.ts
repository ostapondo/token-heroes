import {
  heroById,
  heroLevel,
  hire,
  isUnlocked,
  levelCost,
  levelUp,
  stepBattle,
  strike,
  unleashUltimate,
  withProgress,
  type BattleStep,
  type GameSave,
  type PartyState,
  type Roster,
} from '@engine';
import { t, tCount } from '@i18n';
import { LogLevel, SpendRefusal, type Host } from '@platform';
import type { Arena } from '@render';
import { SESSION_TIMING } from '../constants';
import {
  markFailed,
  markReady,
  receiveTokens,
  replaceGame,
  replaceWallet,
  showNotice,
} from '../store/game-actions';
import { createGameStore, type GameStore } from '../store/game-store';
import { loadGame } from './load-game';

const describe = (error: unknown): string =>
  error instanceof Error ? (error.stack ?? error.message) : String(error);

export class GameSession {
  readonly store: GameStore = createGameStore();
  readonly roster: Roster;
  readonly #host: Host;
  readonly #starterHeroId: string;
  readonly #stops: (() => void)[] = [];
  #arena: Arena | null = null;

  constructor(host: Host, roster: Roster, starterHeroId: string) {
    this.#host = host;
    this.roster = roster;
    this.#starterHeroId = starterHeroId;
  }

  readonly strike = (): void => {
    this.#play((game) => strike(game.battle, game.party, this.roster));
  };

  readonly unleashUltimate = (): void => {
    this.#play((game) => unleashUltimate(game.battle, game.party, this.roster));
  };

  readonly levelUp = (heroId: string): void => {
    this.#guard('Levelling up', async () => {
      const game = this.#game();
      const level = game ? heroLevel(game.party, heroId) : undefined;

      if (level === undefined) return;
      const cost = levelCost(heroById(this.roster, heroId), level);

      if (await this.#spend(cost)) {
        this.#changeParty((party) => levelUp(party, heroId), heroId);
      }
    });
  };

  readonly hire = (heroId: string): void => {
    this.#guard('Hiring', async () => {
      const hero = heroById(this.roster, heroId);

      if (!isUnlocked(hero, this.store.getState().wallet.burned)) return;
      if (await this.#spend(hero.hireCost)) {
        this.#changeParty((party) => hire(party, heroId), heroId);
      }
    });
  };

  reportError(error: unknown, where: string): void {
    this.#host.log(LogLevel.Error, `${where}: ${describe(error)}`);
  }

  attachArena(arena: Arena | null): void {
    this.#arena = arena;
    const game = this.#game();

    if (arena && game) arena.show(game.battle, game.party);
  }

  async start(): Promise<void> {
    try {
      const [loaded, wallet] = await Promise.all([
        loadGame(this.#host, this.roster, this.#starterHeroId, Date.now()),
        this.#host.wallet(),
      ]);

      markReady(this.store, loaded.game, wallet);
      if (loaded.stagesCleared > 0)
        showNotice(this.store, tCount('notice.away', loaded.stagesCleared));
      this.#run();
    } catch (error) {
      this.reportError(error, 'Starting the game');
      markFailed(this.store);
    }
  }

  stop(): void {
    for (const stop of this.#stops.splice(0)) stop();
    this.#guard('Saving on exit', () => this.save());
  }

  #run(): void {
    const tickSeconds = SESSION_TIMING.tickMs / 1000;
    const ticker = setInterval(() => {
      this.#play((game) => stepBattle(game.battle, tickSeconds, game.party, this.roster));
    }, SESSION_TIMING.tickMs);
    const saver = setInterval(
      () => this.#guard('Autosave', () => this.save()),
      SESSION_TIMING.autosaveMs,
    );
    const unlisten = this.#host.onWallet((wallet, burnedNow) =>
      receiveTokens(this.store, wallet, burnedNow),
    );

    const saveOnHide = () => this.#guard('Saving on hide', () => this.save());

    window.addEventListener('pagehide', saveOnHide);
    this.#stops.push(
      () => clearInterval(ticker),
      () => clearInterval(saver),
      () => window.removeEventListener('pagehide', saveOnHide),
      unlisten,
    );
  }

  #game(): GameSave | null {
    return this.store.getState().game;
  }

  #play(step: (game: GameSave) => BattleStep): void {
    const game = this.#game();

    if (!game) return;
    const { battle, events } = step(game);

    if (battle === game.battle) return;
    const next = withProgress(game, battle, game.party, Date.now());

    replaceGame(this.store, next);
    this.#arena?.show(next.battle, next.party);
    if (events.length > 0) this.#arena?.play(events);
  }

  #changeParty(change: (party: PartyState) => PartyState, heroId: string): void {
    const game = this.#game();

    if (!game) return;
    const party = change(game.party);
    const next = withProgress(game, game.battle, party, Date.now());

    replaceGame(this.store, next);
    this.#arena?.show(next.battle, next.party);
    this.#arena?.celebrate(heroId, heroLevel(party, heroId) ?? 1);
    this.#guard('Saving a purchase', () => this.save());
  }

  async #spend(amount: number): Promise<boolean> {
    const result = await this.#host.spend(amount);

    if (result.ok) {
      replaceWallet(this.store, result.wallet);

      return true;
    }
    const refused = result.reason === SpendRefusal.Insufficient;

    showNotice(this.store, t(refused ? 'notice.notEnoughCoins' : 'notice.hostUnavailable'));

    return false;
  }

  async save(): Promise<void> {
    const game = this.#game();

    if (!game) return;
    try {
      await this.#host.writeSave(game);
    } catch (error) {
      this.reportError(error, 'Saving');
      showNotice(this.store, t('notice.saveFailed'));
    }
  }

  #guard(where: string, work: () => Promise<void>): void {
    work().catch((error: unknown) => this.reportError(error, where));
  }
}

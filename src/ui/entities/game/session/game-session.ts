import {
  ascend,
  ascensionOffer,
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
import { LogLevel, type Host } from '@platform';
import type { Arena } from '@render';
import {
  markFailed,
  markReady,
  receiveTokens,
  replaceGame,
  showNotice,
} from '../store/game-actions';
import { createGameStore, type GameStore } from '../store/game-store';
import { errorText } from '../model/error-text';
import { formatPower, partyPowerOf } from '../model/power';
import { startLoop } from './game-loop';
import { loadGame } from './load-game';
import { spendCoins } from './spend-coins';

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
      const cost = levelCost(level);

      if (await spendCoins(this.#host, this.store, cost)) {
        this.#changeParty((party) => levelUp(party, heroId), heroId);
      }
    });
  };

  readonly hire = (heroId: string): void => {
    this.#guard('Hiring', async () => {
      const hero = heroById(this.roster, heroId);

      if (!isUnlocked(hero, this.store.getState().wallet.burned)) return;
      if (await spendCoins(this.#host, this.store, hero.hireCost)) {
        this.#changeParty((party) => hire(party, heroId), heroId);
      }
    });
  };

  readonly ascend = (): void => {
    const game = this.#game();

    if (!game || !ascensionOffer(game).available) return;
    const next = ascend(game, this.roster, Date.now());

    replaceGame(this.store, next);
    this.#arena?.show(next.battle, next.party);
    showNotice(this.store, t('notice.ascended', { power: formatPower(partyPowerOf(next)) }));
    this.#guard('Saving the ascension', () => this.save());
  };

  reportError(error: unknown, where: string): void {
    this.#host.log(LogLevel.Error, `${where}: ${errorText(error)}`);
  }

  attachArena(arena: Arena | null): void {
    this.#arena = arena;
    const game = this.#game();

    if (arena && game) arena.show(game.battle, game.party);
  }

  async start(): Promise<void> {
    try {
      const wallet = await this.#host.wallet();
      const moment = { now: Date.now(), spent: wallet.spent };
      const loaded = await loadGame(this.#host, this.roster, this.#starterHeroId, moment);

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
    this.#stops.push(
      ...startLoop({
        host: this.#host,
        tick: (seconds) =>
          this.#play((game) => stepBattle(game.battle, seconds, game.party, this.roster)),
        save: (where) => this.#guard(where, () => this.save()),
        receive: (wallet, burnedNow) => receiveTokens(this.store, wallet, burnedNow),
      }),
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

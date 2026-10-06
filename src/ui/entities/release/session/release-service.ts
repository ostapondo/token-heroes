import type { Host } from '@platform';
import { RELEASE_TIMING, ReleasePhase } from '../constants';
import { createReleaseStore, type ReleaseStore } from '../store/release-store';

export class ReleaseService {
  readonly store: ReleaseStore = createReleaseStore();
  readonly #host: Host;
  #timer: ReturnType<typeof setInterval> | null = null;

  constructor(host: Host) {
    this.#host = host;
  }

  start(): void {
    void this.check();
    this.#timer = setInterval(() => void this.check(), RELEASE_TIMING.checkEveryMs);
  }

  stop(): void {
    if (this.#timer !== null) clearInterval(this.#timer);
    this.#timer = null;
  }

  async check(): Promise<void> {
    const offer = await this.#host.checkForUpdate();

    if (this.store.getState().phase !== ReleasePhase.Installing) this.store.setState({ offer });
  }

  readonly install = async (beforeRestart: () => Promise<void>): Promise<void> => {
    this.store.setState({ phase: ReleasePhase.Installing });
    await beforeRestart();
    const installed = await this.#host.installUpdate();

    if (!installed) this.store.setState({ phase: ReleasePhase.Failed });
  };

  readonly reportBug = (): void => {
    void this.#host.reportBug();
  };
}

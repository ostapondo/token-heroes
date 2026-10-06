import type { Host, UpdateOffer } from '@platform';
import { describe, expect, it } from 'vitest';
import { ReleasePhase } from '../constants';
import { ReleaseService } from './release-service';

const OFFER: UpdateOffer = { version: '0.2.0', notes: null };

function hostWith(offer: UpdateOffer | null, installUpdate: () => Promise<boolean>) {
  const host: Host = {
    wallet: () => Promise.resolve({ burned: 0, spent: 0, balance: 0 }),
    onWallet: () => () => undefined,
    spend: () => Promise.resolve({ ok: true, wallet: { burned: 0, spent: 0, balance: 0 } }),
    loadSave: () => Promise.resolve(null),
    writeSave: () => Promise.resolve(),
    log: () => undefined,
    checkForUpdate: () => Promise.resolve(offer),
    installUpdate,
    reportBug: () => Promise.resolve(true),
  };

  return host;
}

describe('ReleaseService', () => {
  it('offers the update the host found', async () => {
    const release = new ReleaseService(hostWith(OFFER, () => Promise.resolve(true)));

    await release.check();

    expect(release.store.getState().offer).toEqual(OFFER);
  });

  it('saves the game before the host installs and restarts', async () => {
    const order: string[] = [];
    const release = new ReleaseService(
      hostWith(OFFER, () => {
        order.push('install');

        return Promise.resolve(true);
      }),
    );

    await release.install(() => {
      order.push('save');

      return Promise.resolve();
    });

    expect(order).toEqual(['save', 'install']);
    expect(release.store.getState().phase).toBe(ReleasePhase.Installing);
  });

  it('lets the player try again when the install fails', async () => {
    const release = new ReleaseService(hostWith(OFFER, () => Promise.resolve(false)));

    await release.install(() => Promise.resolve());

    expect(release.store.getState().phase).toBe(ReleasePhase.Failed);
  });
});

import { t } from '@i18n';
import { ARENA } from '@render';
import { useRef } from 'react';
import { useSession } from '../../../entities/game';
import { useArena } from '../hooks/use-arena';
import { arenaViewRecipe } from './arena-view.recipe';
import { BossBar } from './boss-bar';
import { PartyBar } from './party-bar';
import { WipeOverlay } from './wipe-overlay';

const ASPECT_RATIO = { aspectRatio: `${ARENA.width} / ${ARENA.height}` } as const;

export function ArenaView() {
  const session = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const classes = arenaViewRecipe();

  useArena(canvasRef);

  return (
    <div className={classes.root}>
      <canvas
        ref={canvasRef}
        role="button"
        tabIndex={0}
        aria-label={t('arena.strike')}
        className={classes.canvas}
        style={ASPECT_RATIO}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') session.strike();
        }}
      />
      <BossBar />
      <PartyBar />
      <WipeOverlay />
    </div>
  );
}

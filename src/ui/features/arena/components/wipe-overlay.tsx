import { t } from '@i18n';
import { useShallow } from 'zustand/react/shallow';
import { selectWipeStatus, useGame } from '../../../entities/game';
import { wipeOverlayRecipe } from './wipe-overlay.recipe';

export function WipeOverlay() {
  const { wiped, secondsLeft } = useGame(useShallow(selectWipeStatus));
  const classes = wipeOverlayRecipe();

  if (!wiped) return null;

  return (
    <output className={classes.root}>
      <span className={classes.title}>{t('wipe.title')}</span>
      <span className={classes.detail}>{t('wipe.kept')}</span>
      <span className={classes.countdown}>{secondsLeft}</span>
    </output>
  );
}

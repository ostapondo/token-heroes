import { t } from '@i18n';
import { pixelButton } from '@styled/recipes';
import { useSession } from '../../../entities/game';
import {
  ReleasePhase,
  selectOffer,
  selectPhase,
  useRelease,
  useReleaseState,
} from '../../../entities/release';
import { useVersion } from '../hooks/use-version';
import { aboutPanelRecipe } from './about-panel.recipe';

const UPDATE_LABEL = {
  [ReleasePhase.Idle]: 'release.update',
  [ReleasePhase.Installing]: 'release.installing',
  [ReleasePhase.Failed]: 'release.retry',
} as const;

export function AboutPanel() {
  const session = useSession();
  const release = useRelease();
  const offer = useReleaseState(selectOffer);
  const phase = useReleaseState(selectPhase);
  const version = useVersion();
  const classes = aboutPanelRecipe();

  return (
    <div className={classes.root}>
      <h3 className={classes.title}>{t('about.title')}</h3>
      <span className={classes.version}>
        {version ? t('about.version', { version }) : t('about.devBuild')}
      </span>
      <p className={classes.text}>{t('about.coins')}</p>
      <p className={classes.note}>{t('about.data')}</p>
      <div className={classes.actions}>
        {offer ? (
          <button
            type="button"
            className={pixelButton({ tone: 'coin' })}
            disabled={phase === ReleasePhase.Installing}
            onClick={() => void release.install(() => session.save())}
          >
            {t(UPDATE_LABEL[phase], { version: offer.version })}
          </button>
        ) : null}
        <button
          type="button"
          className={pixelButton({ tone: 'muted' })}
          onClick={release.reportBug}
        >
          {t('release.reportBug')}
        </button>
      </div>
    </div>
  );
}

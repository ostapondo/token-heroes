import { t } from '@i18n';
import { useSession } from '../../../entities/game';
import {
  ReleasePhase,
  selectOffer,
  selectPhase,
  useRelease,
  useReleaseState,
} from '../../../entities/release';
import { supportLinksRecipe } from './support-links.recipe';

const UPDATE_LABEL = {
  [ReleasePhase.Idle]: 'release.update',
  [ReleasePhase.Installing]: 'release.installing',
  [ReleasePhase.Failed]: 'release.retry',
} as const;

export function SupportLinks() {
  const session = useSession();
  const release = useRelease();
  const offer = useReleaseState(selectOffer);
  const phase = useReleaseState(selectPhase);
  const classes = supportLinksRecipe();

  return (
    <div className={classes.root}>
      {offer && (
        <button
          type="button"
          className={classes.update}
          disabled={phase === ReleasePhase.Installing}
          onClick={() => void release.install(() => session.save())}
        >
          {t(UPDATE_LABEL[phase], { version: offer.version })}
        </button>
      )}
      <button type="button" className={classes.report} onClick={release.reportBug}>
        {t('release.reportBug')}
      </button>
    </div>
  );
}

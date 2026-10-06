import { t } from '@i18n';
import { pixelButton } from '@styled/recipes';
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { formatPower, selectAscension, useGame, useSession } from '../../../entities/game';
import { ascensionRecipe } from './ascension.recipe';

export function Ascension() {
  const session = useSession();
  const offer = useGame(useShallow(selectAscension));
  const dialog = useRef<HTMLDialogElement>(null);
  const classes = ascensionRecipe();

  if (!offer || (!offer.available && offer.power === 1)) return null;
  const confirm = () => {
    session.ascend();
    dialog.current?.close();
  };

  return (
    <div className={classes.root}>
      {offer.power > 1 && (
        <span className={classes.power}>
          {t('ascend.power', { power: formatPower(offer.power) })}
        </span>
      )}
      {offer.available && (
        <button type="button" className={classes.open} onClick={() => dialog.current?.showModal()}>
          {t('ascend.button')}
        </button>
      )}
      <dialog ref={dialog} className={classes.dialog} aria-labelledby="ascend-title">
        <h2 id="ascend-title" className={classes.title}>
          {t('ascend.title')}
        </h2>
        <p className={classes.body}>{t('ascend.body')}</p>
        <p className={classes.change}>
          {t('ascend.change', {
            from: formatPower(offer.power),
            to: formatPower(offer.nextPower),
          })}
        </p>
        <div className={classes.actions}>
          <button
            type="button"
            className={pixelButton({ tone: 'muted' })}
            onClick={() => dialog.current?.close()}
          >
            {t('ascend.cancel')}
          </button>
          <button type="button" className={pixelButton({ tone: 'ultimate' })} onClick={confirm}>
            {t('ascend.confirm')}
          </button>
        </div>
      </dialog>
    </div>
  );
}

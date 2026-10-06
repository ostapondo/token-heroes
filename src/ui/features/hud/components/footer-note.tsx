import { t } from '@i18n';
import { compactNumber } from '@render';
import { selectBurned, useGame } from '../../../entities/game';
import { footerNoteStyle } from './footer-note.recipe';

export function FooterNote() {
  const burned = useGame(selectBurned);

  return <p className={footerNoteStyle}>{t('hud.footer', { burned: compactNumber(burned) })}</p>;
}

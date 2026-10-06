import { t } from '@i18n';
import { footerNoteStyle } from './footer-note.recipe';

export function FooterNote() {
  return <p className={footerNoteStyle}>{t('hud.footer')}</p>;
}

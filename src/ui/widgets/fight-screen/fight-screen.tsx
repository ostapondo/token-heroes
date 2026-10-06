import { t } from '@i18n';
import { GameStatus, selectStatus, useGame } from '../../entities/game';
import { ArenaView } from '../../features/arena';
import { FooterNote, TopBar, UltimateBar } from '../../features/hud';
import { PartyPanel } from '../../features/party';
import { SupportLinks } from '../../features/support';
import { StatusMessage } from '../../shared/ui';
import { footerStyle } from './fight-screen.recipe';

export function FightScreen() {
  const status = useGame(selectStatus);

  if (status === GameStatus.Loading) return <StatusMessage text={t('status.loading')} />;
  if (status === GameStatus.Failed) return <StatusMessage text={t('status.failed')} alert />;

  return (
    <>
      <TopBar />
      <ArenaView />
      <UltimateBar />
      <PartyPanel />
      <footer className={footerStyle}>
        <FooterNote />
        <SupportLinks />
      </footer>
    </>
  );
}

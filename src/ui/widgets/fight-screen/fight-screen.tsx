import { t } from '@i18n';
import { useCallback, useState } from 'react';
import { GameStatus, selectStatus, useGame } from '../../entities/game';
import { ArenaView } from '../../features/arena';
import { FooterNote, TopBar, UltimateBar } from '../../features/hud';
import { PartyPanel } from '../../features/party';
import { StatusMessage } from '../../shared/ui';
import { GameMenu } from '../game-menu';
import { footerStyle } from './fight-screen.recipe';

export function FightScreen() {
  const status = useGame(selectStatus);
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  if (status === GameStatus.Loading) return <StatusMessage text={t('status.loading')} />;
  if (status === GameStatus.Failed) return <StatusMessage text={t('status.failed')} alert />;

  return (
    <>
      <TopBar onOpenMenu={openMenu} />
      <ArenaView />
      <UltimateBar />
      <PartyPanel />
      <footer className={footerStyle}>
        <FooterNote />
      </footer>
      {menuOpen ? <GameMenu onClose={closeMenu} /> : null}
    </>
  );
}

import { t } from '@i18n';
import { GameStatus, selectStatus, useGame } from '../../entities/game';
import { ArenaView } from '../../features/arena';
import { FooterNote, TopBar, UltimateBar } from '../../features/hud';
import { PartyPanel } from '../../features/party';
import { StatusMessage } from '../../shared/ui';

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
      <FooterNote />
    </>
  );
}

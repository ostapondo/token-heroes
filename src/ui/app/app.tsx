import type { Host } from '@platform';
import { useSession } from '../entities/game';
import { HostContext } from '../entities/host';
import { NoticeToast } from '../features/notices';
import { ErrorBoundary } from '../shared/ui';
import { FightScreen } from '../widgets/fight-screen';
import { appShellStyle } from './app.recipe';
import { ReleaseProvider } from './providers/release-provider';
import { SessionProvider } from './providers/session-provider';

function Shell() {
  const session = useSession();

  return (
    <main className={appShellStyle}>
      <ErrorBoundary
        area="Fight screen"
        onError={(error, area) => session.reportError(error, area)}
      >
        <FightScreen />
      </ErrorBoundary>
      <NoticeToast />
    </main>
  );
}

export function App({ host }: { readonly host: Host }) {
  return (
    <HostContext value={host}>
      <SessionProvider host={host}>
        <ReleaseProvider host={host}>
          <Shell />
        </ReleaseProvider>
      </SessionProvider>
    </HostContext>
  );
}

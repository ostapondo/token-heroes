import type { Host } from '@platform';
import { useSession } from '../entities/game';
import { NoticeToast } from '../features/notices';
import { ErrorBoundary } from '../shared/ui';
import { FightScreen } from '../widgets/fight-screen';
import { appShellStyle } from './app.recipe';
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
    <SessionProvider host={host}>
      <Shell />
    </SessionProvider>
  );
}

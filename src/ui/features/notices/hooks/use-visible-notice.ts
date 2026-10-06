import { useEffect, useState } from 'react';
import { selectNotice, useGame, type Notice } from '../../../entities/game';
import { NOTICE_VISIBLE_MS } from '../constants';

export function useVisibleNotice(): Notice | null {
  const notice = useGame(selectNotice);
  const [expiredId, setExpiredId] = useState<number | null>(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setExpiredId(notice.id), NOTICE_VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [notice]);

  return notice && notice.id !== expiredId ? notice : null;
}

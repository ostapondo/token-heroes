import { useVisibleNotice } from '../hooks/use-visible-notice';
import { noticeToastStyle } from './notice-toast.recipe';

export function NoticeToast() {
  const notice = useVisibleNotice();

  if (!notice) return null;

  return <output className={noticeToastStyle}>{notice.text}</output>;
}

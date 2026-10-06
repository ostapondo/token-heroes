import { css } from '@styled/css';

export const noticeToastStyle = css({
  position: 'absolute',
  insetInline: '3',
  bottom: '3',
  padding: '3',
  background: 'raised',
  border: '2px solid {colors.coin}',
  textStyle: 'body',
});

import { css } from '@styled/css';

export const footerStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  columnGap: '2',
  paddingInline: '3.5',
  borderTop: '2px solid {colors.panel}',
});

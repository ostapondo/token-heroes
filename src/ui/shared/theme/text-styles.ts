import { defineTextStyles } from '@pandacss/dev';

const display = (fontSize: string) => ({
  value: { fontFamily: 'display', fontWeight: '400', fontSize, lineHeight: '1' },
});

const body = (fontSize: string, fontWeight = '400') => ({
  value: { fontFamily: 'body', fontWeight, fontSize, lineHeight: '1.35' },
});

export const textStyles = defineTextStyles({
  countdown: display('64px'),
  banner: display('36px'),
  title: display('26px'),
  heading: display('22px'),
  tag: display('18px'),
  label: body('14px', '600'),
  body: body('13px'),
  small: body('12px'),
  caption: body('11px'),
});

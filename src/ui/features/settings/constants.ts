import { Setting } from '@platform';

export const TOGGLES = [
  { setting: Setting.ShowBalance, label: 'settings.showBalance', note: 'settings.showBalanceNote' },
  {
    setting: Setting.StartAtLogin,
    label: 'settings.startAtLogin',
    note: 'settings.startAtLoginNote',
  },
  { setting: Setting.CloseOnBlur, label: 'settings.closeOnBlur', note: 'settings.closeOnBlurNote' },
] as const;

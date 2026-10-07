import { t } from '@i18n';
import { useEffect, useRef, useState } from 'react';
import { BurnReport } from '../../features/burn-report';
import { SettingsPanel } from '../../features/settings';
import { AboutPanel } from '../../features/support';
import { IconButton } from '../../shared/ui';
import { gameMenuRecipe } from './game-menu.recipe';

const MenuTab = { Stats: 'stats', Settings: 'settings', About: 'about' } as const;

type MenuTab = (typeof MenuTab)[keyof typeof MenuTab];

const TABS = [
  { tab: MenuTab.Stats, label: 'menu.tab.stats' },
  { tab: MenuTab.Settings, label: 'menu.tab.settings' },
  { tab: MenuTab.About, label: 'menu.tab.about' },
] as const;

const PANEL = { stats: BurnReport, settings: SettingsPanel, about: AboutPanel } as const;

interface Props {
  readonly onClose: () => void;
}

// The menu covers the whole window; its close button stands where the menu button was.
export function GameMenu({ onClose }: Props) {
  const [tab, setTab] = useState<MenuTab>(MenuTab.Stats);
  const close = useRef<HTMLButtonElement>(null);
  const classes = gameMenuRecipe();
  const Panel = PANEL[tab];

  useEffect(() => {
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={classes.root} role="dialog" aria-modal="true" aria-label={t('menu.tabs')}>
      <div className={classes.head}>
        <div className={classes.tabs} role="tablist" aria-label={t('menu.tabs')}>
          {TABS.map(({ tab: option, label }) => (
            <button
              key={option}
              type="button"
              role="tab"
              className={classes.tab}
              aria-selected={option === tab}
              onClick={() => setTab(option)}
            >
              {t(label)}
            </button>
          ))}
        </div>
        <IconButton
          glyph="close"
          label={t('menu.close')}
          onClick={onClose}
          buttonRef={close}
          expanded
        />
      </div>
      <div className={classes.body} role="tabpanel">
        <Panel />
      </div>
    </div>
  );
}

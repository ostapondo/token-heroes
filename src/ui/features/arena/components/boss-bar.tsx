import { bossById, CONTENT, elementById } from '@content';
import { t } from '@i18n';
import { compactNumber } from '@render';
import type { CSSProperties } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectBossStatus, useGame } from '../../../entities/game';
import { Meter } from '../../../shared/ui';
import { bossBarRecipe } from './boss-bar.recipe';

export function BossBar() {
  const status = useGame(useShallow(selectBossStatus));
  const classes = bossBarRecipe();

  if (!status) return null;
  const boss = bossById(CONTENT, status.bossId);
  const element = elementById(CONTENT, boss.element);
  const accent: CSSProperties & Record<'--accent', string> = { '--accent': element.accent };

  return (
    <div className={classes.root} style={accent}>
      <span className={classes.tag}>{element.name.toUpperCase()}</span>
      <div className={classes.panel}>
        <span className={classes.name}>{boss.name}</span>
        <Meter
          value={status.hp / status.maxHp}
          label={boss.name}
          tone="accent"
          size="framed"
          accent={element.accent}
        />
        <span className={classes.hp}>
          {t('arena.bossHp', { hp: compactNumber(status.hp), maxHp: compactNumber(status.maxHp) })}
        </span>
      </div>
    </div>
  );
}

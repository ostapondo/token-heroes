import { bossCard, CONTENT } from '@content';
import { t } from '@i18n';
import { compactNumber } from '@render';
import type { CSSProperties } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectBossStatus, useGame } from '../../../entities/game';
import { Meter } from '../../../shared/ui';
import { SUPER_BOSS_TAG } from '../constants';
import { bossBarRecipe } from './boss-bar.recipe';

export function BossBar() {
  const status = useGame(useShallow(selectBossStatus));

  if (!status) return null;
  const card = bossCard(CONTENT, status.bossId);
  const { element } = card;
  const classes = bossBarRecipe({ superBoss: card.tier !== null });
  const accent: CSSProperties & Record<'--accent', string> = { '--accent': element.accent };

  return (
    <div className={classes.root} style={accent}>
      <span className={classes.tag}>
        {card.tier ? t(SUPER_BOSS_TAG[card.tier]) : element.name.toUpperCase()}
      </span>
      <div className={classes.panel}>
        <span className={classes.name}>{card.name}</span>
        <Meter
          value={status.hp / status.maxHp}
          label={card.name}
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

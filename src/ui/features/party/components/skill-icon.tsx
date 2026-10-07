import { t } from '@i18n';
import { rankNumeral, skillIcon } from '@render';
import { useEffect, useRef } from 'react';
import { selectSkillReadyIn, useGame } from '../../../entities/game';
import { ICON_PIXELS } from '../constants';
import { chargeCover } from '../model/skill-charge';
import type { SkillChip } from '../types';
import { skillIconRecipe } from './skill-icon.recipe';

interface Props {
  readonly chip: SkillChip;
  readonly open: boolean;
  readonly onToggle: (skillId: string) => void;
  // A recruit's skills are shown dimmed, as what hiring them brings.
  readonly preview?: boolean;
}

export function SkillIcon({ chip, open, onToggle, preview = false }: Props) {
  const classes = skillIconRecipe({ open });
  const canvas = useRef<HTMLCanvasElement>(null);
  const readyIn = useGame(selectSkillReadyIn(chip.id));
  const locked = chip.locked || preview;
  const cover = locked ? 0 : chargeCover(readyIn, chip.cooldown, ICON_PIXELS);

  useEffect(() => {
    const context = canvas.current?.getContext('2d');

    if (!context) return;
    context.clearRect(0, 0, ICON_PIXELS, ICON_PIXELS);
    context.drawImage(skillIcon(chip.id, chip.icon, chip.tier, locked), 0, 0);
  }, [chip.id, chip.icon, chip.tier, locked]);

  const label = locked
    ? t('party.skill.lockedLabel', { skill: chip.name })
    : t('party.skill.label', { skill: chip.name, rank: rankNumeral(chip.rank) });

  return (
    <button
      type="button"
      className={classes.root}
      aria-label={label}
      aria-expanded={open}
      onClick={() => onToggle(chip.id)}
    >
      <canvas ref={canvas} width={ICON_PIXELS} height={ICON_PIXELS} className={classes.image} />
      {cover > 0 ? <span className={classes.cover} style={{ height: `${cover * 100}%` }} /> : null}
      {locked ? null : <span className={classes.rank}>{rankNumeral(chip.rank)}</span>}
    </button>
  );
}

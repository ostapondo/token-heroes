import { meter } from '@styled/recipes';
import type { CSSProperties } from 'react';

type MeterTone = 'coin' | 'ultimate' | 'accent';
type MeterSize = 'thin' | 'framed';
type AccentStyle = CSSProperties & Record<'--meter-color', string>;

interface Props {
  readonly value: number;
  readonly label: string;
  readonly tone?: MeterTone;
  readonly size?: MeterSize;
  readonly accent?: string;
}

export function Meter({ value, label, tone = 'coin', size = 'thin', accent }: Props) {
  const classes = meter({ tone, size });
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  const accentStyle: AccentStyle | undefined = accent ? { '--meter-color': accent } : undefined;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={classes.track}
      style={accentStyle}
    >
      <div className={classes.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}

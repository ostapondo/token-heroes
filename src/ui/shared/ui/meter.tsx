import { meter } from '@styled/recipes';
import type { CSSProperties } from 'react';

type MeterTone = 'coin' | 'ultimate' | 'heal' | 'accent';
type MeterSize = 'thin' | 'framed';
type AccentStyle = CSSProperties & Record<'--meter-color', string>;
type MarkStyle = CSSProperties & Record<'--mark-color', string>;

interface MeterMark {
  // From 0 at the start of the bar to 1 at its end.
  readonly at: number;
  readonly color: string;
  readonly strong?: boolean;
}

interface Props {
  readonly value: number;
  readonly label: string;
  readonly tone?: MeterTone;
  readonly size?: MeterSize;
  readonly accent?: string;
  readonly marks?: readonly MeterMark[];
}

const percentOf = (value: number) => Math.round(Math.min(Math.max(value, 0), 1) * 100);

export function Meter({ value, label, tone = 'coin', size = 'thin', accent, marks = [] }: Props) {
  const classes = meter({ tone, size });
  const percent = percentOf(value);
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
      {marks.map((mark) => {
        const style: MarkStyle = { left: `${percentOf(mark.at)}%`, '--mark-color': mark.color };

        return (
          <span
            key={`${mark.at}:${mark.color}`}
            aria-hidden="true"
            className={meter({ tone, size, marked: mark.strong ? 'evolves' : 'plain' }).mark}
            style={style}
          />
        );
      })}
    </div>
  );
}

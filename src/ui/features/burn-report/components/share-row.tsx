import { compactNumber } from '@render';
import { token } from '@styled/tokens';
import { Meter } from '../../../shared/ui';
import { shareRowRecipe } from './share-row.recipe';

interface Props {
  readonly label: string;
  readonly tokens: number;
  readonly total: number;
  readonly note?: string | null;
  readonly color?: string;
  readonly chipless?: boolean;
  readonly untracked?: boolean;
}

const PERCENT = 100;
const SMALLEST_SHOWN = 0.1;

function percentOf(share: number): string {
  if (share > 0 && share * PERCENT < SMALLEST_SHOWN) return `<${SMALLEST_SHOWN}%`;

  return `${(share * PERCENT).toFixed(share >= SMALLEST_SHOWN ? 0 : 1)}%`;
}

export function ShareRow({ label, tokens, total, note, color, chipless, untracked }: Props) {
  const classes = shareRowRecipe({ chipless: chipless ?? false, untracked: untracked ?? false });
  const share = total > 0 ? tokens / total : 0;

  return (
    <div className={classes.root}>
      {chipless ? null : <span className={classes.chip} style={{ background: color }} />}
      <span className={classes.name}>
        {label}
        {note ? <span className={classes.note}>{note}</span> : null}
      </span>
      <span className={classes.amount}>{compactNumber(tokens)}</span>
      <span className={classes.share}>{percentOf(share)}</span>
      <span className={classes.meter}>
        <Meter
          value={share}
          label={label}
          tone="accent"
          accent={color ?? token.var('colors.inkDim')}
        />
      </span>
    </div>
  );
}

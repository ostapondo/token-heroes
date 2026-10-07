import { t } from '@i18n';
import { compactNumber } from '@render';
import { token } from '@styled/tokens';
import { AGENT_COLOR, AGENT_LABEL, AGENT_ORDER } from '../../../entities/host';
import type { Bar } from '../types';
import { burnChartRecipe } from './burn-chart.recipe';

const VIEW = { width: 360, height: 110, top: 8, bottom: 16, labels: 34, gap: 3, seam: 1 } as const;
const GRID = [0.5, 1] as const;

interface Props {
  readonly bars: readonly Bar[];
}

export function BurnChart({ bars }: Props) {
  const classes = burnChartRecipe();
  const peak = Math.max(...bars.map((bar) => bar.tokens), 1);
  const plot = VIEW.width - VIEW.labels;
  const step = plot / bars.length;
  const width = Math.max(step - VIEW.gap, 2);
  const floor = VIEW.height - VIEW.bottom;
  const scale = (tokens: number) => (tokens / peak) * (floor - VIEW.top);
  const shown = AGENT_ORDER.filter((agent) => bars.some((bar) => (bar.agents[agent] ?? 0) > 0));
  const tipOf = (bar: Bar) =>
    [
      bar.label,
      ...shown
        .filter((agent) => (bar.agents[agent] ?? 0) > 0)
        .map((agent) =>
          t('burn.tip', {
            label: t(AGENT_LABEL[agent]),
            amount: compactNumber(bar.agents[agent] ?? 0),
          }),
        ),
    ].join('\n');
  const ink = token.var('colors.inkDim');
  const edge = token.var('colors.edge');

  return (
    <div className={classes.root}>
      <svg
        className={classes.svg}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label={t('burn.chart')}
      >
        {GRID.map((share) => (
          <g key={share}>
            <line
              x1={0}
              x2={plot}
              y1={floor - share * (floor - VIEW.top)}
              y2={floor - share * (floor - VIEW.top)}
              stroke={edge}
            />
            <text
              x={VIEW.width}
              y={floor - share * (floor - VIEW.top) + 3}
              textAnchor="end"
              fill={ink}
              fontSize={9}
            >
              {compactNumber(peak * share)}
            </text>
          </g>
        ))}
        <line x1={0} x2={plot} y1={floor} y2={floor} stroke={ink} />
        {bars.map((bar, index) => {
          const x = index * step + (step - width) / 2;
          let base = floor;

          return (
            <g key={bar.label}>
              {AGENT_ORDER.map((agent) => {
                const height = scale(bar.agents[agent] ?? 0);

                if (height <= 0) return null;
                const seam = base < floor ? VIEW.seam : 0;
                const rect = (
                  <rect
                    key={agent}
                    x={x}
                    y={base - height + seam}
                    width={width}
                    height={Math.max(height - seam, 1)}
                    fill={AGENT_COLOR[agent]}
                  />
                );

                base -= height;

                return rect;
              })}
              {bar.tick ? (
                <text
                  x={x + width / 2}
                  y={VIEW.height - 3}
                  textAnchor="middle"
                  fill={ink}
                  fontSize={9}
                >
                  {bar.tick}
                </text>
              ) : null}
              <rect x={index * step} y={0} width={step} height={VIEW.height} fill="transparent">
                <title>{tipOf(bar)}</title>
              </rect>
            </g>
          );
        })}
      </svg>
      <div className={classes.legend}>
        {shown.map((agent) => (
          <span key={agent} className={classes.key}>
            <span className={classes.swatch} style={{ background: AGENT_COLOR[agent] }} />
            {t(AGENT_LABEL[agent])}
          </span>
        ))}
      </div>
    </div>
  );
}

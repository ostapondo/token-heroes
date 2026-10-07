import { t } from '@i18n';
import { compactNumber } from '@render';
import type { TokenKinds } from '@platform';
import { AGENT_COLOR, AGENT_LABEL } from '../../../entities/host';
import { HEADLINE, KIND_LABEL } from '../constants';
import { lastSeen } from '../model/last-seen';
import { BurnRange, type BurnView, type Share } from '../types';
import { BurnChart } from './burn-chart';
import { burnReportRecipe } from './burn-report.recipe';
import { ShareRow } from './share-row';

interface Props {
  readonly view: BurnView;
  readonly range: BurnRange;
  readonly now: Date;
}

const KINDS: readonly (keyof TokenKinds)[] = ['cacheReads', 'cacheWrites', 'input', 'output'];

function Names({ title, shares }: { readonly title: string; readonly shares: readonly Share[] }) {
  const classes = burnReportRecipe();
  const total = shares.reduce((sum, share) => sum + share.tokens, 0);

  if (shares.length === 0) return null;

  return (
    <section className={classes.block}>
      <h4 className={classes.heading}>{title}</h4>
      {shares.map((share) => (
        <ShareRow
          key={share.name}
          label={share.name}
          tokens={share.tokens}
          total={total}
          chipless
        />
      ))}
    </section>
  );
}

export function BurnDetails({ view, range, now }: Props) {
  const classes = burnReportRecipe();
  const kindsTotal = KINDS.reduce((sum, kind) => sum + view.kinds[kind], 0);

  return (
    <>
      <div className={classes.headline}>
        <span className={classes.big}>{compactNumber(view.tokens)}</span>
        <span className={classes.sub}>{t(HEADLINE[range])}</span>
      </div>
      <section className={classes.block}>
        <h4 className={classes.heading}>{t('burn.agents')}</h4>
        {view.agents.length === 0 && view.untracked === 0 ? (
          <p className={classes.note}>{t('burn.empty')}</p>
        ) : null}
        {view.agents.map((line) => {
          const seen = line.lastHour === null ? null : lastSeen(line.lastHour, now);

          return (
            <ShareRow
              key={line.agent}
              label={t(AGENT_LABEL[line.agent])}
              note={seen === null ? t('burn.thisHour') : t('burn.lastAt', { time: seen })}
              tokens={line.tokens}
              total={view.tokens}
              color={AGENT_COLOR[line.agent]}
            />
          );
        })}
        {view.untracked > 0 ? (
          <ShareRow
            label={t('burn.before')}
            note={t('burn.beforeNote')}
            tokens={view.untracked}
            total={view.tokens}
            untracked
          />
        ) : null}
      </section>
      {range === BurnRange.All || view.tokens === 0 ? null : (
        <section className={classes.block}>
          <h4 className={classes.heading}>
            {t(range === BurnRange.Today ? 'burn.byHour' : 'burn.byDay')}
          </h4>
          <BurnChart bars={view.bars} />
        </section>
      )}
      {kindsTotal > 0 ? (
        <section className={classes.block}>
          <h4 className={classes.heading}>{t('burn.kinds')}</h4>
          {KINDS.map((kind) => (
            <ShareRow
              key={kind}
              label={t(KIND_LABEL[kind])}
              tokens={view.kinds[kind]}
              total={kindsTotal}
              chipless
            />
          ))}
          <p className={classes.note}>{t('burn.kindsNote')}</p>
        </section>
      ) : null}
      <Names title={t('burn.projects')} shares={view.projects} />
      <Names title={t('burn.models')} shares={view.models} />
    </>
  );
}

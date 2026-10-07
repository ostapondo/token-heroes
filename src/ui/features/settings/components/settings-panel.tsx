import { t, tCount } from '@i18n';
import { AGENT_COLOR, AGENT_LABEL } from '../../../entities/host';
import { TOGGLES } from '../constants';
import { useSettings, useWatchedAgents } from '../hooks/use-settings';
import { settingsPanelRecipe } from './settings-panel.recipe';

export function SettingsPanel() {
  const { settings, change } = useSettings();
  const agents = useWatchedAgents();
  const classes = settingsPanelRecipe();

  return (
    <div className={classes.root}>
      <section className={classes.block}>
        <h4 className={classes.heading}>{t('settings.tray')}</h4>
        {TOGGLES.map(({ setting, label, note }) => {
          const on = settings?.[setting] ?? false;

          return (
            <div key={setting} className={classes.row}>
              <span className={classes.text}>
                {t(label)}
                <span className={classes.note}>{t(note)}</span>
              </span>
              <button
                type="button"
                role="switch"
                className={classes.switch}
                aria-checked={on}
                aria-label={t(label)}
                disabled={!settings}
                onClick={() => change(setting, !on)}
              />
            </div>
          );
        })}
      </section>
      <section className={classes.block}>
        <h4 className={classes.heading}>{t('settings.agents')}</h4>
        {agents.map((watched) => {
          const row = settingsPanelRecipe({ found: watched.found });

          return (
            <div key={watched.agent} className={row.agent}>
              <span className={row.chip} style={{ background: AGENT_COLOR[watched.agent] }} />
              <span className={row.text}>
                {t(AGENT_LABEL[watched.agent])}
                <span className={row.path}>
                  {watched.transcripts === null
                    ? watched.path
                    : `${watched.path} · ${tCount('settings.transcripts', watched.transcripts)}`}
                </span>
              </span>
              <span className={row.state}>
                {t(watched.found ? 'settings.watching' : 'settings.notFound')}
              </span>
            </div>
          );
        })}
        <p className={classes.note}>{t('settings.agentsNote')}</p>
      </section>
    </div>
  );
}

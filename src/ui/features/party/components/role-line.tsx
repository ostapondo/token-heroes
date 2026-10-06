import { HeroRole } from '@engine';
import { t } from '@i18n';
import { compactNumber } from '@render';
import type { RoleAction } from '../types';
import { roleLineRecipe } from './role-line.recipe';

const ROLE_NAME = {
  [HeroRole.Striker]: 'party.role.striker',
  [HeroRole.Healer]: 'party.role.healer',
  [HeroRole.Tank]: 'party.role.tank',
} as const;

const ROLE_ACTION = {
  [HeroRole.Striker]: 'party.action.striker',
  [HeroRole.Healer]: 'party.action.healer',
  [HeroRole.Tank]: 'party.action.tank',
} as const;

export function RoleLine({ action }: { readonly action: RoleAction }) {
  const classes = roleLineRecipe({ role: action.role });

  return (
    <span className={classes.root}>
      <span className={classes.role}>{t(ROLE_NAME[action.role])}</span>
      <span>
        {t(ROLE_ACTION[action.role], {
          amount: compactNumber(action.amount),
          seconds: action.seconds.toFixed(1),
          hp: compactNumber(action.hp),
        })}
      </span>
    </span>
  );
}

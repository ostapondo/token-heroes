import type { BossDef, CreatureDef, ElementDef, EnemyDef, HeroDef } from './model/definitions';

type Modules<T> = Record<string, { readonly default: T }>;

function collect<T extends { readonly id: string }>(modules: Modules<T>): readonly T[] {
  return Object.values(modules)
    .map((module) => module.default)
    .toSorted((left, right) => left.id.localeCompare(right.id));
}

const byOrder = <T extends { readonly order: number }>(items: readonly T[]): readonly T[] =>
  items.toSorted((left, right) => left.order - right.order);

export interface Content {
  readonly elements: readonly ElementDef[];
  readonly creatures: readonly CreatureDef[];
  readonly bosses: readonly BossDef[];
  readonly enemies: readonly EnemyDef[];
  readonly heroes: readonly HeroDef[];
}

export const CONTENT: Content = {
  elements: collect(import.meta.glob<{ default: ElementDef }>('./elements/*.ts', { eager: true })),
  creatures: collect(
    import.meta.glob<{ default: CreatureDef }>('./creatures/*.ts', { eager: true }),
  ),
  bosses: byOrder(
    collect(import.meta.glob<{ default: BossDef }>('./bosses/*.ts', { eager: true })),
  ),
  enemies: collect(import.meta.glob<{ default: EnemyDef }>('./enemies/*.ts', { eager: true })),
  heroes: byOrder(
    collect(import.meta.glob<{ default: HeroDef }>('./heroes/*.ts', { eager: true })),
  ),
};

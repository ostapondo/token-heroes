import { en } from './catalog/en';

export type MessageKey = keyof typeof en;
type Catalog = Readonly<Record<MessageKey, string>>;

type Placeholders<Template> = Template extends `${string}{${infer Name}}${infer Rest}`
  ? Name | Placeholders<Rest>
  : never;

type ParamsOf<Key extends MessageKey> = Placeholders<(typeof en)[Key]>;
type Params = Readonly<Record<string, string | number>>;

type Arguments<Key extends MessageKey> = [ParamsOf<Key>] extends [never]
  ? []
  : [params: Readonly<Record<ParamsOf<Key>, string | number>>];

type CountedBase = {
  [Key in MessageKey]: Key extends `${infer Base}.one`
    ? `${Base}.other` extends MessageKey
      ? Base
      : never
    : never;
}[MessageKey];

const LOCALE = 'en';

const catalog: Catalog = en;
const pluralRules = new Intl.PluralRules(LOCALE);

function format(template: string, params: Params | undefined): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}

export function t<Key extends MessageKey>(key: Key, ...args: Arguments<Key>): string {
  return format(catalog[key], args[0]);
}

export function tCount(base: CountedBase, count: number, shown = String(count)): string {
  const form = pluralRules.select(count) === 'one' ? 'one' : 'other';
  const template = catalog[`${base}.${form}`];

  return format(template, { count: shown });
}

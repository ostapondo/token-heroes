export const REFRESH_MS = 5_000;
export const TOP_NAMES = 5;
export const FORTNIGHT_DAYS = 14;
export const SECONDS_PER_HOUR = 3_600;
// Days read as 6 Oct, which needs no comma between month and day.
export const DATE_LOCALE = 'en-GB';

export const RANGE_LABEL = {
  today: 'burn.range.today',
  fortnight: 'burn.range.fortnight',
  all: 'burn.range.all',
} as const;

export const HEADLINE = {
  today: 'burn.headline.today',
  fortnight: 'burn.headline.fortnight',
  all: 'burn.headline.all',
} as const;

export const KIND_LABEL = {
  cacheReads: 'burn.kind.cacheReads',
  cacheWrites: 'burn.kind.cacheWrites',
  input: 'burn.kind.input',
  output: 'burn.kind.output',
} as const;

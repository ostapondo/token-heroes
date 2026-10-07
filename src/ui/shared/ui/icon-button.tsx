import { css } from '@styled/css';
import type { Ref } from 'react';
import { iconBadgeStyle, iconButtonRecipe } from './icon-button.recipe';

// Pixel glyphs on an 8 by 8 grid, so the open and close buttons draw at the same size.
const GLYPH = {
  menu: 'M0 1h8v1H0zM0 3.5h8v1H0zM0 6h8v1H0z',
  close: [
    'M0 0h2v1H0zM1 1h2v1H1zM2 2h2v1H2zM3 3h2v2H3zM2 5h2v1H2zM1 6h2v1H1zM0 7h2v1H0z',
    'M6 0h2v1H6zM5 1h2v1H5zM4 2h2v1H4zM4 5h2v1H4zM5 6h2v1H5zM6 7h2v1H6z',
  ].join(''),
} as const;

const badgeClass = css(iconBadgeStyle);

interface Props {
  readonly glyph: keyof typeof GLYPH;
  readonly label: string;
  readonly onClick: () => void;
  readonly badge?: boolean;
  readonly expanded?: boolean;
  readonly buttonRef?: Ref<HTMLButtonElement>;
}

export function IconButton({ glyph, label, onClick, badge, expanded, buttonRef }: Props) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={iconButtonRecipe()}
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <svg viewBox="0 0 8 8" width="16" height="16" shapeRendering="crispEdges" aria-hidden="true">
        <path fill="currentColor" d={GLYPH[glyph]} />
      </svg>
      {badge ? <span className={badgeClass} /> : null}
    </button>
  );
}

import { defineRecipe, defineSlotRecipe } from '@pandacss/dev';

export const pixelButton = defineRecipe({
  className: 'pixel-button',
  base: {
    minHeight: 'touch',
    minWidth: 'button',
    paddingInline: '3',
    border: 'none',
    textStyle: 'label',
    cursor: 'pointer',
    _active: { transform: 'translateY(2px)' },
    _disabled: { cursor: 'not-allowed', transform: 'none' },
    _focusVisible: { outline: '2px solid {colors.ink}', outlineOffset: '2px' },
  },
  variants: {
    tone: {
      coin: {
        background: 'coin',
        color: 'coinInk',
        boxShadow: 'inset 0 -3px 0 {colors.coinShade}',
      },
      ultimate: {
        background: 'ultimate',
        color: 'ultimateInk',
        boxShadow: 'inset 0 -3px 0 {colors.ultimateShade}',
      },
      muted: {
        background: 'raised',
        color: 'textMuted',
        boxShadow: 'inset 0 -3px 0 {colors.void}',
      },
    },
    lettering: {
      body: {},
      display: { textStyle: 'heading' },
    },
  },
  defaultVariants: { tone: 'coin', lettering: 'body' },
});

export const panel = defineRecipe({
  className: 'panel',
  base: {
    background: 'surface',
    border: '2px solid {colors.border}',
  },
  variants: {
    outline: {
      solid: {},
      dashed: { borderStyle: 'dashed' },
    },
  },
  defaultVariants: { outline: 'solid' },
});

export const meter = defineSlotRecipe({
  className: 'meter',
  slots: ['track', 'fill', 'mark'],
  base: {
    track: { position: 'relative', background: 'void' },
    fill: { height: '100%', background: 'var(--meter-color)' },
    // A place along the bar where something arrives, standing out above and below it.
    mark: {
      position: 'absolute',
      top: '-3px',
      bottom: '-3px',
      width: '2px',
      transform: 'translateX(-1px)',
      background: 'var(--mark-color)',
    },
  },
  variants: {
    tone: {
      coin: { track: { '--meter-color': '{colors.coin}' } },
      ultimate: { track: { '--meter-color': '{colors.ultimate}' } },
      heal: { track: { '--meter-color': '{colors.heal}' } },
      accent: {},
    },
    marked: {
      evolves: {
        mark: { width: '4px', transform: 'translateX(-2px)', boxShadow: '0 0 0 1px {colors.void}' },
      },
      plain: {},
    },
    size: {
      thin: { track: { height: '6px' } },
      framed: { track: { height: '10px', border: '2px solid {colors.void}' } },
    },
  },
  defaultVariants: { tone: 'coin', size: 'thin' },
});

import { defineKeyframes } from '@pandacss/dev';

export const keyframes = defineKeyframes({
  incomePop: {
    '0%': { opacity: 0, transform: 'translateY(8px)' },
    '15%': { opacity: 1, transform: 'translateY(0)' },
    '75%': { opacity: 1 },
    '100%': { opacity: 0, transform: 'translateY(-6px)' },
  },
});

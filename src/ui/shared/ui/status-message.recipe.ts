import { cva } from '@styled/css';

export const statusMessageRecipe = cva({
  base: { padding: '6', textAlign: 'center', textStyle: 'body' },
  variants: {
    tone: {
      quiet: { color: 'textMuted' },
      alert: { color: 'text' },
    },
  },
  defaultVariants: { tone: 'quiet' },
});

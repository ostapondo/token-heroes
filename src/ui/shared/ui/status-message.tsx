import { statusMessageRecipe } from './status-message.recipe';

interface Props {
  readonly text: string;
  readonly alert?: boolean;
}

export function StatusMessage({ text, alert = false }: Props) {
  return (
    <p
      role={alert ? 'alert' : 'status'}
      className={statusMessageRecipe({ tone: alert ? 'alert' : 'quiet' })}
    >
      {text}
    </p>
  );
}

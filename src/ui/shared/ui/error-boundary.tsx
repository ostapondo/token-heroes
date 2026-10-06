import { t } from '@i18n';
import { pixelButton } from '@styled/recipes';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { errorBoundaryRecipe } from './error-boundary.recipe';

interface Props {
  readonly area: string;
  readonly onError: (error: unknown, area: string) => void;
  readonly children: ReactNode;
}

interface State {
  readonly failed: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError(error, `${this.props.area}${info.componentStack ?? ''}`);
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    const classes = errorBoundaryRecipe();

    return (
      <div className={classes.root}>
        <p className={classes.title}>{t('error.title')}</p>
        <p className={classes.detail}>{t('error.safe')}</p>
        <button
          type="button"
          className={pixelButton()}
          onClick={() => this.setState({ failed: false })}
        >
          {t('error.reload')}
        </button>
      </div>
    );
  }
}

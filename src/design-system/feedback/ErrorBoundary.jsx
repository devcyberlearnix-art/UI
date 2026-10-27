import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from '../primitives/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.handleReset,
        });
      }

      return (
        <div className="p-8 my-6 rounded-2xl bg-brand-rose/10 border border-brand-rose/20 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-brand-rose/20 text-rose-400 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">
            Unable to display this section
          </h4>
          <p className="text-sm text-ink-400 mb-5">
            {this.state.error?.message || 'An unexpected runtime issue occurred. Please retry.'}
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={this.handleReset}
            leftIcon={RotateCcw}
          >
            Retry Component
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

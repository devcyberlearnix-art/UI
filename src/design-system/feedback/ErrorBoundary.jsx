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
        <div className="p-8 sm:p-10 my-6 rounded-3xl bg-[#0B0B0F]/90 border border-[#FF007A]/20 text-center max-w-lg mx-auto shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_40px_rgba(255,0,122,0.06)] backdrop-blur-2xl">
          <div className="relative mb-5 mx-auto w-14 h-14">
            <div className="w-14 h-14 rounded-2xl bg-[#FF007A]/10 border border-[#FF007A]/25 text-[#FF007A] flex items-center justify-center shadow-[0_0_20px_rgba(255,0,122,0.2)]">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="absolute -inset-2 bg-[#FF007A]/10 rounded-3xl blur-xl -z-10" />
          </div>
          <h4 className="text-xl font-bold text-[#F5F5F7] tracking-tight mb-2">
            Curriculum Service Interrupted
          </h4>
          <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed mb-6 max-w-sm mx-auto">
            {this.state.error?.message || 'A transient distributed gateway timeout occurred. All state has been safely preserved.'}
          </p>
          <Button
            variant="danger"
            size="md"
            onClick={this.handleReset}
            leftIcon={RotateCcw}
          >
            Reconnect Gateway & Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

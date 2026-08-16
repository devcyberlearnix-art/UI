import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', backgroundColor: '#fef2f2', color: '#991b1b' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>⚠️ Application Crashed</h1>
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '0.5rem', maxWidth: '800px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Error Message:</p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.message || 'Unknown error'}</p>
          </div>
          <details style={{ marginTop: '1rem', cursor: 'pointer', maxWidth: '800px' }}>
            <summary style={{ fontWeight: 'bold' }}>Component Stack Trace</summary>
            <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', fontSize: '0.85rem', padding: '1rem', backgroundColor: '#fecaca', borderRadius: '0.5rem', color: '#450a0a' }}>
              {this.state.errorInfo?.componentStack || this.state.error?.stack || 'No stack trace available'}
            </pre>
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.25rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
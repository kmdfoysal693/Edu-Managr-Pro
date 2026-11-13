import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application ErrorBoundary caught an error:', error, errorInfo);
  }

  handleResetStorage = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-black text-xl">
              !
            </div>
            <h1 className="text-lg font-extrabold text-slate-900">Application Recovery Mode</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              The dashboard encountered a temporary state error ({this.state.errorMessage}). You can reload the page or reset cached data below.
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              >
                Reset Cache &amp; Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-light p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-3xl font-serif font-bold text-primary mb-4">Oops! Something went wrong.</h1>
            <p className="text-gray-600 mb-6 max-w-lg">We're sorry for the inconvenience. Our team has been notified, and we're working to fix the issue. Please try reloading the application.</p>
            <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-accent hover:text-primary transition-colors"
            >
                Reload App
            </button>
             {this.state.error && (
                <div className="mt-8 text-left bg-red-50 p-4 rounded-lg max-w-2xl w-full overflow-auto">
                    <h3 className="font-bold text-red-800">Error Details</h3>
                    <pre className="text-red-700 text-xs whitespace-pre-wrap mt-2">
                        <code>
                            {this.state.error.toString()}
                            <br />
                            {this.state.error.stack}
                        </code>
                    </pre>
                </div>
            )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

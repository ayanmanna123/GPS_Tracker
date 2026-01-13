import React from "react";
import * as Sentry from "@sentry/react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.MODE === "development") {
      console.error("❌ Error caught by Error Boundary:", error);
      console.error("Error Info:", errorInfo);
    }

    // Capture exception in Sentry
    Sentry.withScope((scope) => {
      scope.setContext("errorBoundary", {
        componentStack: errorInfo.componentStack,
        errorBoundaryLocation: this.props.location || "unknown",
      });

      const eventId = Sentry.captureException(error);

      this.setState({
        error,
        errorInfo,
        eventId,
      });
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          eventId={this.state.eventId}
          onReload={this.handleReload}
          onReset={this.handleReset}
          showDetails={import.meta.env.MODE === "development"}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback UI Component
 */
const ErrorFallback = ({
  error,
  errorInfo,
  eventId,
  onReload,
  onReset,
  showDetails = false,
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    onReset();
    navigate("/");
  };

  const handleReportFeedback = () => {
    if (eventId) {
      Sentry.showReportDialog({
        eventId,
        title: "We encountered an error",
        subtitle: "Our team has been notified. If you'd like to help, tell us what happened below.",
        subtitle2: "",
        labelName: "Name",
        labelEmail: "Email",
        labelComments: "What happened?",
        labelClose: "Close",
        labelSubmit: "Submit",
        errorGeneric: "An error occurred while submitting your feedback. Please try again.",
        errorFormEntry: "Some fields were invalid. Please correct the errors and try again.",
        successMessage: "Your feedback has been sent. Thank you!",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-500" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Something Went Wrong
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            We've encountered an unexpected error.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Our team has been automatically notified and is working on a fix.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {showDetails && error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
              Error Details (Development Mode):
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300 font-mono mb-2">
              {error.toString()}
            </p>
            {errorInfo?.componentStack && (
              <details className="text-xs text-red-600 dark:text-red-400">
                <summary className="cursor-pointer hover:underline">
                  Component Stack
                </summary>
                <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-x-auto">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Event ID (for support) */}
        {eventId && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <span className="font-semibold">Error ID:</span>{" "}
              <code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                {eventId}
              </code>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
              Please provide this ID when contacting support.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Reload Page
          </button>

          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>

          {eventId && (
            <button
              onClick={handleReportFeedback}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              📝 Report Issue
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If the problem persists, please{" "}
            <a
              href="/support"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              contact our support team
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Higher-order component to wrap routes with error boundary
 * @param {Component} Component - React component to wrap
 */
export const withErrorBoundary = (Component, options = {}) => {
  return (props) => (
    <ErrorBoundary location={options.location || Component.name}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

/**
 * Hook to manually trigger error boundary
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};

export default ErrorBoundary;

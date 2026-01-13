import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export const initializeSentry = () => {
  const sentryDSN = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || "development";

  if (!sentryDSN) {
    console.warn(
      "⚠️  Sentry DSN not configured. Error tracking disabled. Set VITE_SENTRY_DSN in .env file."
    );
    return;
  }

  Sentry.init({
    dsn: sentryDSN,
    environment,
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration({
        tracePropagationTargets: [
          "localhost",
          /^https:\/\/gps-tracker.*\.vercel\.app/,
          /^https:\/\/where-is-my-bus\.netlify\.app/,
        ],
      }),
      // Replay integration for session recording
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      // React profiler for component performance
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Session Replay
    replaysSessionSampleRate: environment === "production" ? 0.1 : 0.5, // 10% in prod
    replaysOnErrorSampleRate: 1.0, // 100% on errors

    // Enhanced error context
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Add browser and device context
      if (error) {
        event.contexts = {
          ...event.contexts,
          browser: {
            name: navigator.userAgent,
            version: navigator.appVersion,
            language: navigator.language,
          },
          device: {
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
          },
        };
      }

      // Filter out specific errors in production
      if (environment === "production") {
        // Don't send network errors
        if (
          error?.message?.includes("Failed to fetch") ||
          error?.message?.includes("Network request failed")
        ) {
          return null;
        }

        // Don't send auth0 errors (handled separately)
        if (error?.message?.includes("Auth0")) {
          return null;
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      "Non-Error promise rejection captured",
      "ResizeObserver loop",
      "ChunkLoadError",
      "Loading chunk",
      "Importing a module script failed",
    ],
  });

  console.log(`✅ Sentry initialized for ${environment} environment`);
};

/**
 * Capture exception manually with additional context
 * @param {Error} error - The error object
 * @param {Object} context - Additional context
 */
export const captureException = (error, context = {}) => {
  Sentry.withScope((scope) => {
    // Add custom context
    Object.keys(context).forEach((key) => {
      scope.setContext(key, context[key]);
    });

    // Set severity level
    if (error.status >= 500) {
      scope.setLevel("error");
    } else if (error.status >= 400) {
      scope.setLevel("warning");
    } else {
      scope.setLevel("info");
    }

    Sentry.captureException(error);
  });
};

/**
 * Capture custom message
 * @param {String} message - The message
 * @param {String} level - Severity level (info, warning, error)
 * @param {Object} context - Additional context
 */
export const captureMessage = (message, level = "info", context = {}) => {
  Sentry.withScope((scope) => {
    Object.keys(context).forEach((key) => {
      scope.setContext(key, context[key]);
    });
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
};

/**
 * Set user context for error tracking
 * @param {Object} user - User object
 */
export const setUserContext = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.sub,
      email: user.email,
      username: user.name || user.nickname,
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb for debugging
 * @param {String} message - Breadcrumb message
 * @param {String} category - Category (navigation, http, user, etc.)
 * @param {Object} data - Additional data
 */
export const addBreadcrumb = (message, category = "custom", data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: "info",
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Start a performance transaction
 * @param {String} name - Transaction name
 * @param {String} op - Operation type (navigation, http, etc.)
 * @returns {Transaction} - Sentry transaction
 */
export const startTransaction = (name, op = "custom") => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Higher-order component to wrap components with error boundary
 * @param {Component} Component - React component to wrap
 * @param {Object} options - Error boundary options
 */
// Export a default fallback component
export const ErrorFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 dark:text-red-500 mb-4">
          Oops!
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          We've been notified and are working on a fix.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export const withErrorBoundary = (Component, options = {}) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: options.fallback || ErrorFallback,
    showDialog: options.showDialog || false,
    ...options,
  });
};

export default Sentry;

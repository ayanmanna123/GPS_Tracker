import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

/**
 * Initialize Sentry for error tracking and performance monitoring
 * @param {Object} app - Express app instance
 */
export const initializeSentry = (app) => {
  const sentryDSN = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || "development";

  if (!sentryDSN) {
    console.warn(
      "⚠️  Sentry DSN not configured. Error tracking disabled. Set SENTRY_DSN in .env file."
    );
    return;
  }

  Sentry.init({
    dsn: sentryDSN,
    environment,
    integrations: [
      // Performance monitoring
      nodeProfilingIntegration(),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev
    profilesSampleRate: environment === "production" ? 0.1 : 1.0,

    // Enhanced error context
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Add custom context
      if (error) {
        event.contexts = {
          ...event.contexts,
          custom: {
            errorType: error.constructor.name,
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Filter out specific errors in production
      if (environment === "production") {
        // Don't send 404 errors
        if (event.message?.includes("404") || event.message?.includes("Not Found")) {
          return null;
        }

        // Don't send validation errors
        if (error?.name === "ValidationError") {
          return null;
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      "Non-Error promise rejection captured",
      "Network request failed",
      "AbortError",
      "CanceledError",
    ],
  });

  console.log(`✅ Sentry initialized for ${environment} environment`);
};

/**
 * Get Sentry request handler middleware
 * Must be used BEFORE all routes
 */
export const sentryRequestHandler = () => {
  return Sentry.Handlers.requestHandler();
};

/**
 * Get Sentry tracing middleware
 * Must be used BEFORE all routes
 */
export const sentryTracingHandler = () => {
  return Sentry.Handlers.tracingHandler();
};

/**
 * Get Sentry error handler middleware
 * Must be used AFTER all routes but BEFORE other error handlers
 */
export const sentryErrorHandler = () => {
  return Sentry.Handlers.errorHandler();
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
      id: user._id || user.id,
      email: user.email,
      username: user.name || user.username,
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
 * @param {String} op - Operation type (http, db, task, etc.)
 * @returns {Transaction} - Sentry transaction
 */
export const startTransaction = (name, op = "custom") => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Performance monitoring decorator for async functions
 * @param {String} operationName - Name of the operation
 */
export const withPerformanceMonitoring = (operationName) => {
  return (target, propertyName, descriptor) => {
    const method = descriptor.value;

    descriptor.value = async function (...args) {
      const transaction = startTransaction(operationName, "function");

      try {
        const result = await method.apply(this, args);
        transaction.setStatus("ok");
        return result;
      } catch (error) {
        transaction.setStatus("internal_error");
        captureException(error, {
          operation: operationName,
          args: args.map((arg) => JSON.stringify(arg).substring(0, 100)),
        });
        throw error;
      } finally {
        transaction.finish();
      }
    };

    return descriptor;
  };
};

/**
 * Flush Sentry events (useful for serverless/graceful shutdown)
 * @param {Number} timeout - Timeout in milliseconds
 */
export const flushSentry = async (timeout = 2000) => {
  try {
    await Sentry.close(timeout);
    console.log("✅ Sentry events flushed successfully");
  } catch (error) {
    console.error("❌ Error flushing Sentry events:", error);
  }
};

export default Sentry;
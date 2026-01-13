import { captureException, addBreadcrumb } from "../utils/sentry.js";

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, statusCode = 500, isOperational = true, context = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Add request context to error
      error.requestContext = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        userId: req.user?.sub || req.user?._id,
      };
      next(error);
    });
  };
};

/**
 * Not Found (404) handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new APIError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    true,
    {
      method: req.method,
      url: req.originalUrl,
      availableRoutes: Object.keys(req.app._router.stack)
        .filter((key) => req.app._router.stack[key].route)
        .map((key) => req.app._router.stack[key].route.path)
        .slice(0, 5),
    }
  );

  addBreadcrumb("404 Not Found", "navigation", {
    url: req.originalUrl,
    method: req.method,
  });

  next(error);
};

/**
 * Development error handler - sends detailed error info
 */
const sendErrorDev = (err, req, res) => {
  console.error("💥 ERROR:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    status: "error",
    error: err,
    message: err.message,
    stack: err.stack,
    context: err.context,
    requestContext: err.requestContext,
    timestamp: err.timestamp || new Date().toISOString(),
  });
};

/**
 * Production error handler - sends minimal error info
 */
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      status: "error",
      message: err.message,
      timestamp: err.timestamp || new Date().toISOString(),
    });
  }
  // Programming or unknown error: don't leak error details
  else {
    console.error("💥 ERROR:", err);

    // Send generic message
    res.status(500).json({
      success: false,
      status: "error",
      message: "Something went wrong. Please try again later.",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Handle specific error types
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new APIError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field}='${value}'. Please use another value.`;
  return new APIError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new APIError(message, 400);
};

const handleJWTError = () => {
  return new APIError("Invalid token. Please log in again.", 401);
};

const handleJWTExpiredError = () => {
  return new APIError("Your token has expired. Please log in again.", 401);
};

const handleMulterError = (err) => {
  let message = "File upload error";
  
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "File size is too large. Maximum size is 5MB.";
  } else if (err.code === "LIMIT_FILE_COUNT") {
    message = "Too many files. Maximum 5 files allowed.";
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    message = "Unexpected file field.";
  }

  return new APIError(message, 400);
};

/**
 * Global error handling middleware
 * Must be used AFTER all routes
 */
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Add breadcrumb for debugging
  addBreadcrumb("Error occurred", "error", {
    message: err.message,
    statusCode: err.statusCode,
    url: req.originalUrl,
    method: req.method,
  });

  const environment = process.env.NODE_ENV || "development";

  if (environment === "development") {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Handle specific error types
    if (err.name === "CastError") error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") error = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (err.name === "MulterError") error = handleMulterError(err);

    // Capture exception in Sentry (only for non-operational errors)
    if (!error.isOperational || error.statusCode >= 500) {
      captureException(err, {
        request: {
          method: req.method,
          url: req.originalUrl,
          headers: req.headers,
          body: req.body,
          query: req.query,
          params: req.params,
        },
        user: req.user
          ? {
              id: req.user.sub || req.user._id,
              email: req.user.email,
            }
          : null,
        context: error.context,
      });
    }

    sendErrorProd(error, req, res);
  }
};

/**
 * Database connection error handler
 */
export const handleDatabaseError = (error) => {
  console.error("💥 Database Connection Error:", error.message);

  captureException(error, {
    context: "database_connection",
    timestamp: new Date().toISOString(),
  });

  if (process.env.NODE_ENV === "production") {
    // In production, exit process to let container orchestration restart
    console.error("🛑 Shutting down due to database error...");
    process.exit(1);
  }
};

/**
 * Uncaught exception handler
 */
export const handleUncaughtException = () => {
  process.on("uncaughtException", (error) => {
    console.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
    console.error(error.name, error.message);
    console.error(error.stack);

    captureException(error, {
      context: "uncaught_exception",
      fatal: true,
    });

    // Give Sentry time to send the error
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};

/**
 * Unhandled rejection handler
 */
export const handleUnhandledRejection = () => {
  process.on("unhandledRejection", (reason, promise) => {
    console.error("💥 UNHANDLED REJECTION! Shutting down...");
    console.error("Reason:", reason);

    const error = new Error(`Unhandled Rejection: ${reason}`);
    error.promise = promise;

    captureException(error, {
      context: "unhandled_rejection",
      reason: String(reason),
      fatal: true,
    });

    // Give Sentry time to send the error
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};

/**
 * Graceful shutdown handler
 */
export const handleGracefulShutdown = (server) => {
  const shutdown = (signal) => {
    console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);

    server.close(() => {
      console.log("✅ HTTP server closed");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error("⚠️  Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

/**
 * Request logger middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  console.log(`➡️  ${req.method} ${req.originalUrl}`);

  // Add breadcrumb
  addBreadcrumb(`${req.method} ${req.originalUrl}`, "http", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Log response
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor =
      res.statusCode >= 500
        ? "\x1b[31m" // Red
        : res.statusCode >= 400
        ? "\x1b[33m" // Yellow
        : "\x1b[32m"; // Green

    console.log(
      `${statusColor}⬅️  ${res.statusCode}\x1b[0m ${req.method} ${req.originalUrl} - ${duration}ms`
    );

    // Log slow requests
    if (duration > 3000) {
      console.warn(`⚠️  SLOW REQUEST: ${req.method} ${req.originalUrl} took ${duration}ms`);
      addBreadcrumb("Slow request", "performance", {
        duration,
        method: req.method,
        url: req.originalUrl,
      });
    }
  });

  next();
};

export default {
  APIError,
  asyncHandler,
  notFoundHandler,
  globalErrorHandler,
  handleDatabaseError,
  handleUncaughtException,
  handleUnhandledRejection,
  handleGracefulShutdown,
  requestLogger,
};

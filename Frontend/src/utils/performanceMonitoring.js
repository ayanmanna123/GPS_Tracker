import { startTransaction, captureMessage, addBreadcrumb } from "../services/sentryService";

/**
 * Performance monitoring utility hook
 * Tracks component render times and lifecycle
 */
export const usePerformanceMonitoring = (componentName) => {
  const [renderCount, setRenderCount] = React.useState(0);
  const mountTime = React.useRef(Date.now());

  React.useEffect(() => {
    setRenderCount((prev) => prev + 1);

    // Track component mount
    addBreadcrumb(`Component Mounted: ${componentName}`, "ui", {
      timestamp: Date.now(),
    });

    return () => {
      // Track component unmount and lifetime
      const lifetime = Date.now() - mountTime.current;
      addBreadcrumb(`Component Unmounted: ${componentName}`, "ui", {
        lifetime,
        renderCount,
      });

      // Alert if component had excessive renders
      if (renderCount > 50) {
        captureMessage(
          `Excessive renders detected: ${componentName} rendered ${renderCount} times`,
          "warning",
          {
            component: componentName,
            renderCount,
            lifetime,
          }
        );
      }
    };
  }, []);

  return { renderCount };
};

/**
 * Measure function execution time
 * @param {String} operationName - Name of the operation
 * @param {Function} fn - Function to measure
 * @returns {Any} - Result of the function
 */
export const measurePerformance = async (operationName, fn) => {
  const transaction = startTransaction(operationName, "function");
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    transaction.setStatus("ok");
    transaction.setData("duration", duration);

    // Log slow operations
    if (duration > 1000) {
      captureMessage(`Slow operation: ${operationName} took ${duration}ms`, "warning", {
        operation: operationName,
        duration,
      });
    }

    addBreadcrumb(`Operation Complete: ${operationName}`, "performance", {
      duration,
      status: "success",
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    transaction.setStatus("internal_error");
    transaction.setData("duration", duration);

    addBreadcrumb(`Operation Failed: ${operationName}`, "performance", {
      duration,
      status: "error",
      error: error.message,
    });

    throw error;
  } finally {
    transaction.finish();
  }
};

/**
 * Track page load performance
 */
export const trackPageLoadPerformance = () => {
  if (typeof window === "undefined") return;

  window.addEventListener("load", () => {
    // Use Performance API
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    // Track metrics
    captureMessage("Page Load Performance", "info", {
      performance: {
        pageLoadTime,
        connectTime,
        renderTime,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      },
    });

    // Alert on slow page loads
    if (pageLoadTime > 5000) {
      captureMessage(`Slow page load detected: ${pageLoadTime}ms`, "warning", {
        pageLoadTime,
        url: window.location.href,
      });
    }
  });
};

/**
 * Track API call performance
 * @param {String} endpoint - API endpoint
 * @param {Number} duration - Request duration in ms
 * @param {Number} status - HTTP status code
 */
export const trackAPIPerformance = (endpoint, duration, status) => {
  const isSuccess = status >= 200 && status < 300;
  const isSlow = duration > 2000;

  if (!isSuccess || isSlow) {
    captureMessage(
      `API Performance Issue: ${endpoint}`,
      isSlow ? "warning" : "error",
      {
        endpoint,
        duration,
        status,
        isSlow,
        isSuccess,
      }
    );
  }
};

/**
 * Memory monitoring utility
 */
export const monitorMemoryUsage = () => {
  if (typeof window === "undefined" || !window.performance?.memory) return;

  const memory = window.performance.memory;
  const usedMemoryMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
  const totalMemoryMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
  const limitMemoryMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);

  const usagePercentage = ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2);

  // Alert if memory usage is high
  if (usagePercentage > 80) {
    captureMessage(`High memory usage detected: ${usagePercentage}%`, "warning", {
      memory: {
        used: usedMemoryMB,
        total: totalMemoryMB,
        limit: limitMemoryMB,
        usagePercentage,
      },
    });
  }

  return {
    used: usedMemoryMB,
    total: totalMemoryMB,
    limit: limitMemoryMB,
    usagePercentage,
  };
};

/**
 * Track user interactions
 * @param {String} action - Interaction action (click, scroll, etc.)
 * @param {String} element - Element identifier
 * @param {Object} metadata - Additional metadata
 */
export const trackUserInteraction = (action, element, metadata = {}) => {
  addBreadcrumb(`User Interaction: ${action} on ${element}`, "user", {
    action,
    element,
    ...metadata,
    timestamp: Date.now(),
  });
};

/**
 * Network quality monitoring
 */
export const monitorNetworkQuality = () => {
  if (typeof navigator === "undefined" || !navigator.connection) return null;

  const connection = navigator.connection;
  const networkInfo = {
    effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
    downlink: connection.downlink, // Mbps
    rtt: connection.rtt, // Round-trip time in ms
    saveData: connection.saveData, // Data saver mode
  };

  // Alert on poor network
  if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
    captureMessage("Poor network quality detected", "info", {
      network: networkInfo,
    });
  }

  return networkInfo;
};

/**
 * Long task monitoring (tasks > 50ms block main thread)
 */
export const monitorLongTasks = () => {
  if (typeof PerformanceObserver === "undefined") return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Long task detected
        captureMessage(`Long task detected: ${entry.duration}ms`, "warning", {
          longTask: {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
          },
        });
      }
    });

    observer.observe({ entryTypes: ["longtask"] });
  } catch (error) {
    console.warn("Long task monitoring not supported");
  }
};

/**
 * Initialize all performance monitoring
 */
export const initializePerformanceMonitoring = () => {
  trackPageLoadPerformance();
  monitorLongTasks();

  // Monitor memory every 30 seconds
  setInterval(() => {
    monitorMemoryUsage();
  }, 30000);

  // Monitor network quality every minute
  setInterval(() => {
    monitorNetworkQuality();
  }, 60000);

  console.log("✅ Performance monitoring initialized");
};

export default {
  usePerformanceMonitoring,
  measurePerformance,
  trackPageLoadPerformance,
  trackAPIPerformance,
  monitorMemoryUsage,
  trackUserInteraction,
  monitorNetworkQuality,
  monitorLongTasks,
  initializePerformanceMonitoring,
};

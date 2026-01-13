import axios from "axios";
import { captureException, addBreadcrumb, startTransaction } from "./sentryService.jsx";
import { toast } from "sonner";

export const axiosInstance = axios.create({});

// Request interceptor to add performance tracking
axiosInstance.interceptors.request.use(
  (config) => {
    // Start performance transaction
    config.metadata = { startTime: new Date() };
    
    // Add breadcrumb for API call
    addBreadcrumb(
      `API Request: ${config.method?.toUpperCase()} ${config.url}`,
      "http",
      {
        method: config.method,
        url: config.url,
      }
    );
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to track errors and performance
axiosInstance.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
    
    // Log slow requests
    if (duration > 3000) {
      addBreadcrumb(
        `Slow API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        "performance",
        {
          duration,
          status: response.status,
        }
      );
    }
    
    return response;
  },
  (error) => {
    // Calculate request duration
    const duration = error.config?.metadata?.startTime
      ? new Date() - error.config.metadata.startTime
      : 0;

    // Capture API error in Sentry
    if (error.response) {
      // Server responded with error status
      const errorData = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
        duration,
      };

      // Only capture 5xx errors and important 4xx errors
      if (error.response.status >= 500 || error.response.status === 401 || error.response.status === 403) {
        captureException(error, {
          api_error: errorData,
          request: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data,
            params: error.config?.params,
          },
        });
      }

      // Add breadcrumb for all errors
      addBreadcrumb(
        `API Error: ${error.response.status} ${error.config?.url}`,
        "http",
        errorData
      );

      // Show user-friendly error messages
      const message = error.response.data?.message || error.response.data?.error || "An error occurred";
      
      if (error.response.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else if (error.response.status === 401) {
        toast.error("Please log in to continue.");
      } else if (error.response.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (error.response.status === 404) {
        toast.error("Resource not found.");
      } else if (error.response.status === 429) {
        toast.error("Too many requests. Please slow down.");
      }
    } else if (error.request) {
      // Request was made but no response
      captureException(error, {
        api_error: {
          type: "no_response",
          url: error.config?.url,
          method: error.config?.method,
        },
      });
      
      addBreadcrumb("API No Response", "http", {
        url: error.config?.url,
        method: error.config?.method,
      });
      
      toast.error("Network error. Please check your connection.");
    } else {
      // Something else happened
      captureException(error, {
        api_error: {
          type: "request_setup",
          message: error.message,
        },
      });
      
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
    // withCredentials: true,
  });
};

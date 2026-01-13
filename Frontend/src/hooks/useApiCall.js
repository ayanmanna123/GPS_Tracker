import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

/**
 * Production-ready custom hook for handling API calls with automatic loading, error, and success states.
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.apiFunction - Async function that returns a promise (e.g., axios call)
 * @param {Function} [options.onSuccess] - Callback executed on successful API call
 * @param {Function} [options.onError] - Callback executed on error (supplements default toast)
 * @param {string|Function} [options.successMessage] - Success toast message (string or function receiving data)
 * @param {string|Function} [options.errorMessage] - Error toast message (string or function receiving error)
 * @param {boolean} [options.showSuccessToast=true] - Whether to show success toast
 * @param {boolean} [options.showErrorToast=true] - Whether to show error toast
 * @param {boolean} [options.immediate=false] - Execute API call immediately on mount
 * @param {Array} [options.deps=[]] - Dependencies for immediate execution (like useEffect deps)
 *
 * @returns {Object} - { data, loading, error, execute, reset, retry }
 *
 * @example
 * // POST request with success callback
 * const { loading, execute: sendOTP } = useApiCall({
 *   apiFunction: (email) => axios.post('/api/send-otp', { email }),
 *   successMessage: 'OTP sent successfully!',
 *   onSuccess: (data) => setStep('verify')
 * });
 *
 * @example
 * // GET request on mount
 * const { data: tickets, loading, error } = useApiCall({
 *   apiFunction: () => axios.get('/api/tickets', { headers: { Authorization: `Bearer ${token}` } }),
 *   immediate: true,
 *   showSuccessToast: false
 * });
 *
 * @example
 * // Custom error handling with default toast
 * const { loading, execute, error } = useApiCall({
 *   apiFunction: (formData) => axios.post('/api/review', formData),
 *   successMessage: (data) => `Review #${data.id} submitted!`,
 *   onError: (err) => {
 *     if (err.response?.status === 401) navigate('/login');
 *   }
 * });
 */
export const useApiCall = ({
  apiFunction,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  showSuccessToast = true,
  showErrorToast = true,
  immediate = false,
  deps = [],
} = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Store the abort controller for request cancellation
  const abortControllerRef = useRef(null);
  // Store last used params for retry functionality
  const lastParamsRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Extract user-friendly error message from error object
   */
  const extractErrorMessage = useCallback(
    (err) => {
      // If custom error message provided
      if (errorMessage) {
        return typeof errorMessage === "function"
          ? errorMessage(err)
          : errorMessage;
      }

      // Standard error extraction pattern
      return (
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Please try again."
      );
    },
    [errorMessage]
  );

  /**
   * Extract success message
   */
  const extractSuccessMessage = useCallback(
    (responseData) => {
      if (successMessage) {
        return typeof successMessage === "function"
          ? successMessage(responseData)
          : successMessage;
      }
      return null;
    },
    [successMessage]
  );

  /**
   * Execute the API call
   */
  const execute = useCallback(
    async (...params) => {
      // Validate apiFunction exists
      if (!apiFunction) {
        console.error("useApiCall: apiFunction is required");
        return;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      // Store params for retry
      lastParamsRef.current = params;

      try {
        setLoading(true);
        setError(null);

        // Execute the API function with provided params
        const response = await apiFunction(...params);

        // Only update state if component is still mounted
        if (!isMountedRef.current) return;

        // Extract data - handle both axios (response.data) and fetch (response)
        const responseData =
          response?.data !== undefined ? response.data : response;

        setData(responseData);
        setLoading(false);

        // Show success toast if configured
        if (showSuccessToast) {
          const message = extractSuccessMessage(responseData);
          if (message) {
            toast.success(message);
          }
        }

        // Execute success callback
        if (onSuccess) {
          onSuccess(responseData);
        }

        return responseData;
      } catch (err) {
        // Ignore abort errors
        if (err.name === "AbortError" || err.code === "ERR_CANCELED") {
          return;
        }

        // Only update state if component is still mounted
        if (!isMountedRef.current) return;

        const errorMsg = extractErrorMessage(err);

        setError(errorMsg);
        setLoading(false);

        // Show error toast if configured
        if (showErrorToast) {
          toast.error(errorMsg);
        }

        // Execute error callback
        if (onError) {
          onError(err);
        }

        // Re-throw for caller to handle if needed
        throw err;
      }
    },
    [
      apiFunction,
      onSuccess,
      onError,
      showSuccessToast,
      showErrorToast,
      extractSuccessMessage,
      extractErrorMessage,
    ]
  );

  /**
   * Reset all states to initial values
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    lastParamsRef.current = null;
  }, []);

  /**
   * Retry the last failed request with same params
   */
  const retry = useCallback(() => {
    if (lastParamsRef.current) {
      return execute(...lastParamsRef.current);
    }
    return execute();
  }, [execute]);

  // Auto-execute on mount if immediate is true
  useEffect(() => {
    if (immediate && apiFunction) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    retry,
  };
};

export default useApiCall;

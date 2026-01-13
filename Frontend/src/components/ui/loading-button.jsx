import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * LoadingButton - Extension of shadcn/ui Button with built-in loading state support
 *
 * Automatically disables the button and shows a spinner when loading.
 * Prevents double-submission and provides consistent UX across the app.
 *
 * @param {boolean} loading - Whether the button is in loading state
 * @param {string} loadingText - Optional text to show while loading (defaults to children)
 * @param {React.ReactNode} children - Button content
 * @param {boolean} disabled - Additional disabled state (combined with loading)
 * @param {string} className - Additional CSS classes
 * @param {Object} props - All other Button props (variant, size, onClick, etc.)
 *
 * @example
 * // Basic usage
 * <LoadingButton loading={isSubmitting} onClick={handleSubmit}>
 *   Submit
 * </LoadingButton>
 *
 * @example
 * // With custom loading text
 * <LoadingButton
 *   loading={sending}
 *   loadingText="Sending OTP..."
 *   variant="default"
 * >
 *   Send OTP
 * </LoadingButton>
 *
 * @example
 * // With icon
 * <LoadingButton loading={loading} loadingText="Creating...">
 *   <Plus className="mr-2 h-4 w-4" />
 *   Create Bus
 * </LoadingButton>
 */
const LoadingButton = React.forwardRef(
  (
    { children, loading = false, loadingText, disabled, className, ...props },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        disabled={loading || disabled}
        className={cn(className)}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Button>
    );
  },
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };

import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';

/**
 * Centralized error handling utility
 * Converts errors into user-friendly messages and logs them appropriately
 */

export interface AppError {
    message: string;
    code?: string;
    severity: 'error' | 'warning' | 'info';
    technical?: string; // Technical details for logging
}

/**
 * Handle Supabase/Postgrest errors
 */
export function handleSupabaseError(error: PostgrestError): AppError {
    const errorMap: Record<string, string> = {
        // Constraint violations
        '23505': 'This record already exists. Please use a different value.',
        '23503': 'This action would violate data integrity. Related records may exist.',
        '23502': 'Required field is missing.',

        // Permission errors
        '42501': 'You don\'t have permission to perform this action.',
        'PGRST116': 'You don\'t have permission to access this resource.',

        // Rate limiting (if implemented)
        '429': 'Too many requests. Please slow down.',
    };

    const friendlyMessage = errorMap[error.code] ||
        error.message ||
        'An error occurred while processing your request.';

    return {
        message: friendlyMessage,
        code: error.code,
        severity: 'error',
        technical: `${error.code}: ${error.message} ${error.details || ''}`,
    };
}

/**
 * Handle generic JavaScript errors
 */
export function handleGenericError(error: unknown): AppError {
    if (error instanceof Error) {
        // Network errors
        if (error.message.includes('fetch')) {
            return {
                message: 'Network error. Please check your connection and try again.',
                severity: 'error',
                technical: error.message,
            };
        }

        // Validation errors (from Zod, etc.)
        if (error.name === 'ZodError') {
            return {
                message: 'Please check your input and try again.',
                severity: 'warning',
                technical: error.message,
            };
        }

        return {
            message: error.message,
            severity: 'error',
            technical: error.stack,
        };
    }

    return {
        message: 'An unexpected error occurred.',
        severity: 'error',
        technical: String(error),
    };
}

/**
 * Main error handler - routes errors to appropriate handler
 */
export function handleError(error: unknown): AppError {
    // Supabase/Postgrest error
    if (isPostgrestError(error)) {
        return handleSupabaseError(error);
    }

    // Generic error
    return handleGenericError(error);
}

/**
 * Handle error and show toast notification
 */
export function handleErrorWithToast(error: unknown, customMessage?: string): void {
    const appError = handleError(error);

    // Log technical details to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error Details:', appError.technical);
    }

    // TODO: Send to error monitoring service (Sentry, etc.)
    // logErrorToService(appError);

    // Show user-friendly message
    const message = customMessage || appError.message;

    if (appError.severity === 'error') {
        toast.error(message);
    } else if (appError.severity === 'warning') {
        toast.warning(message);
    } else {
        toast.info(message);
    }
}

/**
 * Type guard for Postgrest errors
 */
function isPostgrestError(error: unknown): error is PostgrestError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error
    );
}

/**
 * Async error wrapper for cleaner try-catch
 * Usage: const [result, error] = await tryAsync(() => fetchData())
 */
export async function tryAsync<T>(
    fn: () => Promise<T>
): Promise<[T | null, AppError | null]> {
    try {
        const result = await fn();
        return [result, null];
    } catch (error) {
        return [null, handleError(error)];
    }
}

/**
 * Log error to monitoring service (placeholder for Sentry/etc.)
 */
function logErrorToService(error: AppError): void {
    // TODO: Implement error logging
    // Example: Sentry.captureException(error);
    console.error('[Error Service]:', error);
}

/**
 * Validation error helper
 */
export function createValidationError(message: string): AppError {
    return {
        message,
        severity: 'warning',
        code: 'VALIDATION_ERROR',
    };
}

/**
 * Permission error helper
 */
export function createPermissionError(message?: string): AppError {
    return {
        message: message || 'You don\'t have permission to perform this action.',
        severity: 'error',
        code: 'PERMISSION_DENIED',
    };
}

/**
 * Not found error helper
 */
export function createNotFoundError(resource: string): AppError {
    return {
        message: `${resource} not found.`,
        severity: 'error',
        code: 'NOT_FOUND',
    };
}

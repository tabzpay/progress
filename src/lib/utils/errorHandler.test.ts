/**
 * Error handler tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
    handleSupabaseError,
    handleGenericError,
    handleError,
    createValidationError,
    createPermissionError,
    createNotFoundError,
} from './errorHandler';

describe('Error Handler', () => {
    describe('handleSupabaseError', () => {
        it('maps unique constraint violation', () => {
            const error = {
                code: '23505',
                message: 'duplicate key value',
                details: '',
            };

            const result = handleSupabaseError(error);

            expect(result.message).toBe('This record already exists. Please use a different value.');
            expect(result.code).toBe('23505');
            expect(result.severity).toBe('error');
        });

        it('maps permission error', () => {
            const error = {
                code: '42501',
                message: 'permission denied',
                details: '',
            };

            const result = handleSupabaseError(error);

            expect(result.message).toBe("You don't have permission to perform this action.");
            expect(result.severity).toBe('error');
        });

        it('returns generic message for unknown error code', () => {
            const error = {
                code: 'UNKNOWN',
                message: 'Some error',
                details: '',
            };

            const result = handleSupabaseError(error);

            expect(result.message).toBe('Some error');
        });
    });

    describe('handleGenericError', () => {
        it('handles network errors', () => {
            const error = new Error('fetch failed');

            const result = handleGenericError(error);

            expect(result.message).toContain('Network error');
            expect(result.severity).toBe('error');
        });

        it('handles validation errors', () => {
            const error = new Error('Validation failed');
            error.name = 'ZodError';

            const result = handleGenericError(error);

            expect(result.message).toContain('check your input');
            expect(result.severity).toBe('warning');
        });

        it('handles generic errors', () => {
            const error = new Error('Something went wrong');

            const result = handleGenericError(error);

            expect(result.message).toBe('Something went wrong');
            expect(result.severity).toBe('error');
        });

        it('handles non-Error objects', () => {
            const error = 'String error';

            const result = handleGenericError(error);

            expect(result.message).toBe('An unexpected error occurred.');
        });
    });

    describe('handleError', () => {
        it('routes Postgrest errors to handleSupabaseError', () => {
            const error = {
                code: '23505',
                message: 'duplicate',
            };

            const result = handleError(error);

            expect(result.code).toBe('23505');
        });

        it('routes generic errors to handleGenericError', () => {
            const error = new Error('Test error');

            const result = handleError(error);

            expect(result.message).toBe('Test error');
        });
    });

    describe('Error helper functions', () => {
        it('creates validation error', () => {
            const error = createValidationError('Invalid email');

            expect(error.message).toBe('Invalid email');
            expect(error.severity).toBe('warning');
            expect(error.code).toBe('VALIDATION_ERROR');
        });

        it('creates permission error with default message', () => {
            const error = createPermissionError();

            expect(error.message).toContain("don't have permission");
            expect(error.severity).toBe('error');
            expect(error.code).toBe('PERMISSION_DENIED');
        });

        it('creates permission error with custom message', () => {
            const error = createPermissionError('Custom message');

            expect(error.message).toBe('Custom message');
        });

        it('creates not found error', () => {
            const error = createNotFoundError('Customer');

            expect(error.message).toBe('Customer not found.');
            expect(error.severity).toBe('error');
            expect(error.code).toBe('NOT_FOUND');
        });
    });
});

/**
 * Test utilities
 * Helpers for testing React components
 */

import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement, ReactNode } from 'react';

/**
 * Create a new QueryClient for each test
 * Prevents tests from affecting each other
 */
export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // Don't retry in tests
                gcTime: Infinity, // Don't garbage collect during tests
            },
            mutations: {
                retry: false,
            },
        },
        logger: {
            log: console.log,
            warn: console.warn,
            error: () => { }, // Suppress error logs in tests
        },
    });
}

/**
 * Wrapper component with all providers
 */
interface AllProvidersProps {
    children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
    const testQueryClient = createTestQueryClient();

    return (
        <BrowserRouter>
            <QueryClientProvider client={testQueryClient}>
                {children}
            </QueryClientProvider>
        </BrowserRouter>
    );
}

/**
 * Custom render function with providers
 * Use this instead of React Testing Library's render
 */
export function renderWithProviders(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Mock user for tests
 */
export const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
        full_name: 'Test User',
    },
};

/**
 * Mock customer data
 */
export const mockCustomer = {
    id: 'customer-123',
    user_id: 'test-user-id',
    customer_type: 'individual' as const,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    credit_limit: 10000,
    outstanding_balance: 2500,
    total_credit_issued: 5000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock loan data
 */
export const mockLoan = {
    id: 'loan-123',
    user_id: 'test-user-id',
    customer_id: 'customer-123',
    loan_type: 'personal' as const,
    principal_amount: 5000,
    interest_rate: 5,
    status: 'ACTIVE' as const,
    created_at: '2024-01-01T00:00:00Z',
    due_date: '2024-12-31T00:00:00Z',
};

// Re-export everything from Testing Library
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';

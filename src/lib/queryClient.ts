import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * Centralized configuration for data fetching, caching, and error handling
 */

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Caching & Refetching
            staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5min
            gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection (formerly cacheTime)

            // Refetch on various events
            refetchOnWindowFocus: true, // Refetch when user returns to tab
            refetchOnReconnect: true, // Refetch when internet reconnects
            refetchOnMount: true, // Refetch when component mounts

            // Retry logic
            retry: (failureCount, error: any) => {
                // Don't retry on 4xx errors (client errors)
                if (error?.status >= 400 && error?.status < 500) {
                    return false;
                }
                // Retry up to 3 times for other errors
                return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Error handling
            throwOnError: false, // Don't throw errors, handle them in components
        },
        mutations: {
            // Retry logic for mutations (create, update, delete)
            retry: false, // Don't retry mutations by default

            // Error handling
            throwOnError: false,
        },
    },
});

/**
 * Query key factory for consistent cache keys
 * Prevents typos and makes refactoring easier
 */
export const queryKeys = {
    // Customers
    customers: {
        all: ['customers'] as const,
        lists: () => [...queryKeys.customers.all, 'list'] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.customers.lists(), filters] as const,
        details: () => [...queryKeys.customers.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.customers.details(), id] as const,
        summary: () => [...queryKeys.customers.all, 'summary'] as const,
    },

    // Loans
    loans: {
        all: ['loans'] as const,
        lists: () => [...queryKeys.loans.all, 'list'] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.loans.lists(), filters] as const,
        details: () => [...queryKeys.loans.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.loans.details(), id] as const,
        summary: () => [...queryKeys.loans.all, 'summary'] as const,
    },

    // Groups
    groups: {
        all: ['groups'] as const,
        lists: () => [...queryKeys.groups.all, 'list'] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.groups.lists(), filters] as const,
        details: () => [...queryKeys.groups.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.groups.details(), id] as const,
        members: (id: string) => [...queryKeys.groups.detail(id), 'members'] as const,
    },

    // Payments
    payments: {
        all: ['payments'] as const,
        byLoan: (loanId: string) => [...queryKeys.payments.all, 'loan', loanId] as const,
    },

    // Analytics
    analytics: {
        creditHealth: ['analytics', 'credit-health'] as const,
        dashboard: ['analytics', 'dashboard'] as const,
    },
} as const;

/**
 * Customer Hooks
 * React Query hooks for customer data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../api/customers';
import { queryKeys } from '../queryClient';
import { useAuth } from '../contexts/AuthContext';
import { handleErrorWithToast } from '../utils/errorHandler';
import { toast } from 'sonner';
import type { Customer, CustomerFormData } from '../types/customer';

/**
 * Fetch all customers with optional filters
 */
export function useCustomers(filters?: {
    isActive?: boolean;
    customerType?: 'individual' | 'company';
    searchQuery?: string;
}) {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.customers.list(filters),
        queryFn: () => customersApi.getAll(user!.id, filters),
        enabled: !!user,
    });
}

/**
 * Fetch single customer with detailed stats
 */
export function useCustomer(customerId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.customers.detail(customerId!),
        queryFn: () => customersApi.getDetail(customerId!),
        enabled: !!customerId,
    });
}

/**
 * Fetch customer summary statistics
 */
export function useCustomerSummary() {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.customers.summary(),
        queryFn: () => customersApi.getSummary(user!.id),
        enabled: !!user,
    });
}

/**
 * Search customers (for autocomplete)
 */
export function useCustomerSearch(query: string, limit?: number) {
    const { user } = useAuth();

    return useQuery({
        queryKey: [...queryKeys.customers.all, 'search', query, limit],
        queryFn: () => customersApi.search(user!.id, query, limit),
        enabled: !!user && query.length > 0,
        staleTime: 30 * 1000, // 30 seconds - search results get stale faster
    });
}

/**
 * Create new customer mutation
 */
export function useCreateCustomer() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CustomerFormData) => customersApi.create(user!.id, data),
        onSuccess: () => {
            // Invalidate and refetch customer lists
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.summary() });
            toast.success('Customer created successfully');
        },
        onError: (error) => {
            handleErrorWithToast(error, 'Failed to create customer');
        },
    });
}

/**
 * Update customer mutation
 */
export function useUpdateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CustomerFormData> }) =>
            customersApi.update(id, data),
        onSuccess: (updatedCustomer) => {
            // Update customer in cache
            queryClient.setQueryData(
                queryKeys.customers.detail(updatedCustomer.id),
                updatedCustomer
            );
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
            toast.success('Customer updated successfully');
        },
        onError: (error) => {
            handleErrorWithToast(error, 'Failed to update customer');
        },
    });
}

/**
 * Delete customer mutation
 */
export function useDeleteCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (customerId: string) => customersApi.delete(customerId),
        onSuccess: () => {
            // Invalidate all customer queries
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
            toast.success('Customer deleted successfully');
        },
        onError: (error) => {
            handleErrorWithToast(error, 'Failed to delete customer');
        },
    });
}

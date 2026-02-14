/**
 * Customers API
 * All customer-related API calls
 */

import { createBaseApi, executeQuery, supabase } from './base';
import type { Customer, CustomerFormData, CustomerWithStats } from '../types/customer';

// Create base CRUD operations
const baseCustomersApi = createBaseApi<Customer>('customers');

/**
 * Customers API with custom methods
 */
export const customersApi = {
    ...baseCustomersApi,

    /**
     * Get all customers with optional filters
     */
    async getAll(
        userId: string,
        filters?: {
            isActive?: boolean;
            customerType?: 'individual' | 'company';
            searchQuery?: string;
        }
    ): Promise<Customer[]> {
        let query = supabase
            .from('customers')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (filters?.isActive !== undefined) {
            query = query.eq('is_active', filters.isActive);
        }

        if (filters?.customerType) {
            query = query.eq('customer_type', filters.customerType);
        }

        if (filters?.searchQuery) {
            const search = `%${filters.searchQuery}%`;
            query = query.or(
                `company_name.ilike.${search},first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search}`
            );
        }

        return executeQuery(() => query);
    },

    /**
     * Get customer with detailed stats
     */
    async getDetail(customerId: string): Promise<CustomerWithStats> {
        const customer = await executeQuery(() =>
            supabase.from('customers').select('*').eq('id', customerId).single()
        );

        // Get loan statistics
        const loans = await executeQuery(() =>
            supabase
                .from('loans')
                .select('id, status, created_at, due_date')
                .eq('customer_id', customerId)
        );

        const totalLoans = loans?.length || 0;
        const paidLoans = loans?.filter((l) => l.status === 'PAID').length || 0;
        const overdueLoans =
            loans?.filter((l) => {
                if (l.status === 'PAID') return false;
                if (!l.due_date) return false;
                return new Date(l.due_date) < new Date();
            }).length || 0;

        return {
            ...customer,
            total_loans: totalLoans,
            paid_loans: paidLoans,
            overdue_loans: overdueLoans,
        } as CustomerWithStats;
    },

    /**
     * Create new customer
     */
    async create(userId: string, data: CustomerFormData): Promise<Customer> {
        return executeQuery(() =>
            supabase
                .from('customers')
                .insert([
                    {
                        user_id: userId,
                        ...data,
                        is_active: data.is_active ?? true,
                    },
                ])
                .select()
                .single()
        );
    },

    /**
     * Search customers (for autocomplete)
     */
    async search(userId: string, query: string, limit = 10): Promise<Customer[]> {
        const search = `%${query}%`;

        return executeQuery(() =>
            supabase
                .from('customers')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .or(
                    `company_name.ilike.${search},first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search}`
                )
                .limit(limit)
        );
    },

    /**
     * Get customer summary stats
     */
    async getSummary(userId: string) {
        const customers = await executeQuery(() =>
            supabase
                .from('customers')
                .select('is_active, total_credit_issued, outstanding_balance')
                .eq('user_id', userId)
        );

        return {
            totalCustomers: customers?.length || 0,
            activeCustomers: customers?.filter((c) => c.is_active).length || 0,
            totalCreditIssued: customers?.reduce((sum, c) => sum + (c.total_credit_issued || 0), 0) || 0,
            totalOutstanding: customers?.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0) || 0,
        };
    },
};

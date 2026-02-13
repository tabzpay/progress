// Customer Service - Backend Logic for Customer Management

import { supabase } from './supabase';
import type {
    Customer,
    CustomerFormData,
    CustomerWithStats,
    CreditCheckResult,
    CustomerContact
} from './types/customer';

/**
 * Get all customers for a user with optional filters
 */
export async function getCustomers(
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
        query = query.or(`company_name.ilike.${search},first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search}`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
}

/**
 * Get a single customer with all details including contacts and loan stats
 */
export async function getCustomerDetail(customerId: string): Promise<CustomerWithStats | null> {
    const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

    if (error) throw error;
    if (!customer) return null;

    // Get loan statistics
    const { data: loans } = await supabase
        .from('loans')
        .select('id, status, created_at, due_date')
        .eq('customer_id', customerId);

    const totalLoans = loans?.length || 0;
    const paidLoans = loans?.filter(l => l.status === 'PAID').length || 0;
    const overdueLoans = loans?.filter(l => {
        if (l.status === 'PAID') return false;
        if (!l.due_date) return false;
        return new Date(l.due_date) < new Date();
    }).length || 0;

    // Calculate average days to pay and on-time payment rate
    // (This would require repayment data, simplified for now)

    return {
        ...customer,
        total_loans: totalLoans,
        paid_loans: paidLoans,
        overdue_loans: overdueLoans,
    } as CustomerWithStats;
}

/**
 * Create a new customer
 */
export async function createCustomer(
    userId: string,
    data: CustomerFormData
): Promise<Customer> {
    const { data: customer, error } = await supabase
        .from('customers')
        .insert([{
            user_id: userId,
            ...data,
            is_active: data.is_active ?? true,
        }])
        .select()
        .single();

    if (error) throw error;
    return customer;
}

/**
 * Update an existing customer
 */
export async function updateCustomer(
    customerId: string,
    data: Partial<CustomerFormData>
): Promise<Customer> {
    const { data: customer, error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', customerId)
        .select()
        .single();

    if (error) throw error;
    return customer;
}

/**
 * Delete (or deactivate) a customer
 */
export async function deleteCustomer(customerId: string, hardDelete = false): Promise<void> {
    if (hardDelete) {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', customerId);

        if (error) throw error;
    } else {
        // Soft delete - just mark as inactive
        await updateCustomer(customerId, { is_active: false });
    }
}

/**
 * Check if a loan amount is within customer's credit limit
 */
export async function checkCreditLimit(
    customerId: string,
    loanAmount: number
): Promise<CreditCheckResult> {
    const { data, error } = await supabase
        .rpc('check_customer_credit_limit', {
            customer_uuid: customerId,
            new_loan_amount: loanAmount,
        });

    if (error) throw error;
    return data as CreditCheckResult;
}

/**
 * Update customer financial balances (called automatically by triggers, but can be called manually)
 */
export async function updateCustomerBalance(customerId: string): Promise<void> {
    const { error } = await supabase
        .rpc('update_customer_balances', {
            customer_uuid: customerId,
        });

    if (error) throw error;
}

/**
 * Search customers for autocomplete
 */
export async function searchCustomers(
    userId: string,
    query: string,
    limit = 10
): Promise<Customer[]> {
    const search = `%${query}%`;

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .or(`company_name.ilike.${search},first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search}`)
        .limit(limit);

    if (error) throw error;
    return data || [];
}

/**
 * Get customer contacts
 */
export async function getCustomerContacts(customerId: string): Promise<CustomerContact[]> {
    const { data, error } = await supabase
        .from('customer_contacts')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_primary', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Add a contact to a customer
 */
export async function addCustomerContact(
    customerId: string,
    contact: Omit<CustomerContact, 'id' | 'customer_id' | 'created_at'>
): Promise<CustomerContact> {
    const { data, error } = await supabase
        .from('customer_contacts')
        .insert([{
            customer_id: customerId,
            ...contact,
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update a customer contact
 */
export async function updateCustomerContact(
    contactId: string,
    updates: Partial<Omit<CustomerContact, 'id' | 'customer_id' | 'created_at'>>
): Promise<CustomerContact> {
    const { data, error } = await supabase
        .from('customer_contacts')
        .update(updates)
        .eq('id', contactId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a customer contact
 */
export async function deleteCustomerContact(contactId: string): Promise<void> {
    const { error } = await supabase
        .from('customer_contacts')
        .delete()
        .eq('id', contactId);

    if (error) throw error;
}

/**
 * Get customer summary statistics for dashboard
 */
export async function getCustomerSummary(userId: string): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    totalCreditIssued: number;
    totalOutstanding: number;
}> {
    const { data: customers, error } = await supabase
        .from('customers')
        .select('is_active, total_credit_issued, outstanding_balance')
        .eq('user_id', userId);

    if (error) throw error;

    const totalCustomers = customers?.length || 0;
    const activeCustomers = customers?.filter(c => c.is_active).length || 0;
    const totalCreditIssued = customers?.reduce((sum, c) => sum + (c.total_credit_issued || 0), 0) || 0;
    const totalOutstanding = customers?.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0) || 0;

    return {
        totalCustomers,
        activeCustomers,
        totalCreditIssued,
        totalOutstanding,
    };
}

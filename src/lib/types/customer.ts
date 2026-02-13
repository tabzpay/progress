// Customer Management Types

export interface Customer {
    id: string;
    user_id: string;
    customer_type: 'individual' | 'company';

    // Individual fields
    first_name?: string;
    last_name?: string;

    // Company fields
    company_name?: string;
    tax_id?: string;
    registration_number?: string;

    // Contact
    email?: string;
    phone?: string;
    address?: CustomerAddress;

    // Business terms
    credit_limit: number;
    payment_terms: PaymentTerms;
    currency: string;

    // Financial tracking
    total_credit_issued: number;
    outstanding_balance: number;

    // Metadata
    notes?: string;
    tags?: string[];
    is_active: boolean;

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface CustomerAddress {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
}

export interface CustomerContact {
    id: string;
    customer_id: string;
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    is_primary: boolean;
    created_at: string;
}

export type PaymentTerms =
    | 'Net 7'
    | 'Net 15'
    | 'Net 30'
    | 'Net 60'
    | 'Net 90'
    | 'Due on Receipt';

export interface CustomerFormData {
    customer_type: 'individual' | 'company';
    first_name?: string;
    last_name?: string;
    company_name?: string;
    tax_id?: string;
    registration_number?: string;
    email?: string;
    phone?: string;
    address?: CustomerAddress;
    credit_limit: number;
    payment_terms: PaymentTerms;
    currency: string;
    notes?: string;
    tags?: string[];
    is_active?: boolean;
}

export interface CustomerWithStats extends Customer {
    total_loans: number;
    paid_loans: number;
    overdue_loans: number;
    average_days_to_pay?: number;
    on_time_payment_rate?: number;
}

export interface CreditCheckResult {
    allowed: boolean;
    available_credit?: number;
    over_limit_by?: number;
    message: string;
}

export const PAYMENT_TERMS_OPTIONS: { value: PaymentTerms; label: string; days: number }[] = [
    { value: 'Due on Receipt', label: 'Due on Receipt', days: 0 },
    { value: 'Net 7', label: 'Net 7 (7 days)', days: 7 },
    { value: 'Net 15', label: 'Net 15 (15 days)', days: 15 },
    { value: 'Net 30', label: 'Net 30 (30 days)', days: 30 },
    { value: 'Net 60', label: 'Net 60 (60 days)', days: 60 },
    { value: 'Net 90', label: 'Net 90 (90 days)', days: 90 },
];

// Helper to get customer display name
export function getCustomerDisplayName(customer: Customer): string {
    if (customer.customer_type === 'company') {
        return customer.company_name || 'Unnamed Company';
    } else {
        return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed Customer';
    }
}

// Helper to calculate credit utilization percentage
export function getCreditUtilization(customer: Customer): number {
    if (customer.credit_limit === 0) return 0;
    return (customer.outstanding_balance / customer.credit_limit) * 100;
}

// Helper to get available credit
export function getAvailableCredit(customer: Customer): number {
    return Math.max(0, customer.credit_limit - customer.outstanding_balance);
}

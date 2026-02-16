/**
 * useLoanForm - Form state and validation hook
 * Extracted from CreateLoan.tsx
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoanSchema, type LoanFormData } from '../schemas';
import type { Customer } from '../types/customer';

export type LoanType = 'personal' | 'business' | 'group';

interface UseLoanFormOptions {
    onSuccess?: (data: LoanFormData) => void;
}

export function useLoanForm(options?: UseLoanFormOptions) {
    const form = useForm<LoanFormData>({
        resolver: zodResolver(LoanSchema) as any,
        defaultValues: {
            type: 'personal',
            currency: 'USD',
            borrower_name: '',
            amount: 0,
            due_date: '',
            note: '',
        },
    });

    const { register, handleSubmit, setValue, watch, trigger, formState } = form;
    const { errors } = formState;

    // Watch commonly used fields
    const borrowerName = watch('borrower_name');
    const loanType = watch('type');
    const currency = watch('currency');
    const amount = watch('amount') || 0;
    const dueDate = watch('due_date');
    const note = watch('note');

    // Helper to set customer data
    const setCustomerData = (customer: Customer | null) => {
        if (customer) {
            setValue('borrower_name', customer.company_name || `${customer.first_name} ${customer.last_name}`);
        }
    };

    // Helper to validate current step
    const validateStep = async (step: number): Promise<boolean> => {
        switch (step) {
            case 1: // Loan type
                return await trigger('type');
            case 2: // Borrower
                return await trigger('borrower_name');
            case 3: // Amount and date
                const amountValid = await trigger('amount');
                const dateValid = await trigger('due_date');
                return amountValid && dateValid;
            case 4: // Note (optional)
                return true;
            default:
                return false;
        }
    };

    return {
        // Form instance
        form,

        // Form methods
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        errors,

        // Watched values
        borrowerName,
        loanType,
        currency,
        amount,
        dueDate,
        note,

        // Helpers
        setCustomerData,
        validateStep,
    };
}

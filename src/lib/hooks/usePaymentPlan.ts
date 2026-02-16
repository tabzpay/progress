/**
 * usePaymentPlan - Payment plan configuration hook
 * Handles installment calculations and tax
 */

import { useState, useEffect } from 'react';
import { PlanConfig } from '../LoanCalculator';
import type { PaymentTerms } from '../types/customer';
import { PAYMENT_TERMS_OPTIONS } from '../types/customer';

export type RepaymentSchedule = 'one_time' | 'installments';

interface UsePaymentPlanOptions {
    loanType: 'personal' | 'business' | 'group';
    amount: number;
    onDueDateChange?: (date: string) => void;
}

export function usePaymentPlan(options: UsePaymentPlanOptions) {
    const { loanType, amount, onDueDateChange } = options;

    // Payment plan state
    const [paymentPlan, setPaymentPlan] = useState<PlanConfig | null>(null);
    const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentSchedule>('one_time');

    // Business loan specific
    const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('Net 30');
    const [taxRate, setTaxRate] = useState<number>(0);
    const [taxAmount, setTaxAmount] = useState<number>(0);

    // Auto-calculate tax amount when amount or tax rate changes
    useEffect(() => {
        if (loanType === 'business' && taxRate > 0) {
            const calculated = (amount * taxRate) / 100;
            setTaxAmount(calculated);
        } else {
            setTaxAmount(0);
        }
    }, [amount, taxRate, loanType]);

    // Auto-calculate due date from payment terms (business loans only)
    useEffect(() => {
        if (loanType === 'business' && paymentTerms && onDueDateChange) {
            const today = new Date();
            const termsOption = PAYMENT_TERMS_OPTIONS.find(opt => opt.value === paymentTerms);
            if (termsOption) {
                const dueDate = new Date(today);
                dueDate.setDate(dueDate.getDate() + termsOption.days);
                onDueDateChange(dueDate.toISOString().split('T')[0]);
            }
        }
    }, [loanType, paymentTerms, onDueDateChange]);

    // Calculate total amount (principal + tax)
    const totalAmount = amount + taxAmount;

    // Reset payment plan when switching from installments to one-time
    const handleScheduleChange = (schedule: RepaymentSchedule) => {
        setRepaymentSchedule(schedule);
        if (schedule === 'one_time') {
            setPaymentPlan(null);
        }
    };

    return {
        // One-time vs Installments
        repaymentSchedule,
        setRepaymentSchedule: handleScheduleChange,

        // Payment plan (installments)
        paymentPlan,
        setPaymentPlan,

        // Business loan terms
        paymentTerms,
        setPaymentTerms,

        // Tax
        taxRate,
        setTaxRate,
        taxAmount,
        totalAmount,
    };
}

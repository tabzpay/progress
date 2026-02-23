/**
 * useLoanSubmit - Loan submission hook
 * Handles form submission, encryption, and success flow
 */

import { useState } from 'react';
import { supabase } from '../supabase';
import { analytics } from '../analytics';

import { secureEncrypt } from '../encryption';
import { getPrivacyKey } from '../privacyKeyStore';
import { toast } from 'sonner';
import type { LoanFormData } from '../schemas';
import { calculateInstallments, type PlanConfig } from '../LoanCalculator';

interface SubmitLoanData {
    formData: LoanFormData;
    userId: string;
    customerId?: string;
    groupId?: string;
    paymentPlan?: PlanConfig | null;
    taxRate?: number;
    taxAmount?: number;
    bankDetails?: {
        bankName: string;
        accountName: string;
        accountNumber: string;
    };
    status?: string;
}

export function useLoanSubmit() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [createdLoanId, setCreatedLoanId] = useState<string | null>(null);

    const submitLoan = async (data: SubmitLoanData): Promise<boolean> => {
        const {
            formData,
            userId,
            customerId,
            groupId,
            paymentPlan,
            taxRate = 0,
            taxAmount = 0,
            bankDetails,
            status = 'ACTIVE',
        } = data;

        setIsSubmitting(true);

        try {
            // Encrypt sensitive data if privacy key exists
            const privacyKey = getPrivacyKey();
            let encryptedBorrowerName = formData.borrower_name;
            let encryptedDescription = formData.note || '';

            if (privacyKey) {
                try {
                    encryptedBorrowerName = await secureEncrypt(formData.borrower_name, privacyKey);
                    if (formData.note) {
                        encryptedDescription = await secureEncrypt(formData.note, privacyKey);
                    }
                } catch (encryptError) {
                    console.error('Encryption error:', encryptError);
                    toast.error('Failed to encrypt sensitive data');
                    return false;
                }
            }

            // Prepare loan data
            const loanData: any = {
                lender_id: userId,
                type: formData.type,
                borrower_name: encryptedBorrowerName,
                amount: formData.amount,
                currency: formData.currency,
                due_date: formData.due_date,
                description: encryptedDescription,
                status: status,
            };

            // Add group ID for group loans
            if (groupId) {
                loanData.group_id = groupId;
            }

            // Add tax information for business loans
            if (formData.type === 'business') {
                loanData.tax_rate = taxRate;
                loanData.tax_amount = taxAmount;
            }

            // Insert loan
            const { data: loan, error: loanError } = await supabase
                .from('loans')
                .insert(loanData)
                .select()
                .single();

            if (loanError) throw loanError;

            const loanId = loan.id;
            setCreatedLoanId(loanId);

            // Save bank details if provided
            if (bankDetails && (bankDetails.bankName || bankDetails.accountNumber)) {
                const { error: bankError } = await supabase
                    .from('bank_details')
                    .insert({
                        loan_id: loanId,
                        bank_name: bankDetails.bankName,
                        account_name: bankDetails.accountName,
                        account_number: bankDetails.accountNumber,
                    });

                if (bankError && bankError.code !== 'PGRST205') {
                    console.error('Bank details error:', bankError);
                    // Non-fatal, continue
                }
            }

            // Save installments if payment plan exists
            if (paymentPlan) {
                const computed = calculateInstallments(paymentPlan);
                const installments = computed.map((inst, index) => ({
                    loan_id: loanId,
                    installment_number: index + 1,
                    amount: inst.amount,
                    due_date: inst.dueDate,
                    status: 'PENDING',
                }));

                const { error: installmentsError } = await supabase
                    .from('installments')
                    .insert(installments);

                if (installmentsError) {
                    console.error('Installments error:', installmentsError);
                    // Non-fatal, continue
                }
            }

            // Analytics & logging
            analytics.loanCreated(loanId, {
                type: formData.type,
                amount: formData.amount,
                currency: formData.currency,
                hasGroup: !!groupId,
            });

            // logActivity disabled until activity_log table is created in DB
            // logActivity('LOAN_CREATED', 'Loan created', { type: formData.type, amount: formData.amount });

            // Generate share URL
            const url = `${window.location.origin}/loan/${loanId}`;
            setShareUrl(url);

            // Show success or share modal based on status
            if (status === 'PENDING') {
                setIsShareOpen(true);
                toast.success('Loan offer created! Share the link with the borrower.');
            } else {
                setIsSuccessOpen(true);
                toast.success('Loan created successfully!');
            }

            return true;
        } catch (error) {
            console.error('Error creating loan:', error);
            toast.error('Failed to create loan. Please try again.');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        // Submission state
        isSubmitting,
        submitLoan,

        // Success/Share modals
        isSuccessOpen,
        setIsSuccessOpen,
        isShareOpen,
        setIsShareOpen,
        shareUrl,
        createdLoanId,
    };
}

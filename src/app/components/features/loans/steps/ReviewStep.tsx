/**
 * ReviewStep - Final step: Review all loan details before submission
 */

import { Check, User, DollarSign, Calendar, FileText, CreditCard } from 'lucide-react';
import { Textarea } from '../../../ui/textarea';
import { Label } from '../../../ui/label';
import type { PlanConfig } from '../../../../../lib/LoanCalculator';

interface ReviewStepProps {
    loanType: 'personal' | 'business' | 'group';
    borrowerName: string;
    amount: number;
    currency: string;
    dueDate: string;
    note: string;
    onNoteChange: (note: string) => void;
    paymentTerms?: string;
    taxRate?: number;
    taxAmount?: number;
    repaymentSchedule?: 'one_time' | 'installments';
    paymentPlan?: PlanConfig | null;
}

export function ReviewStep({
    loanType,
    borrowerName,
    amount,
    currency,
    dueDate,
    note,
    onNoteChange,
    paymentTerms,
    taxRate = 0,
    taxAmount = 0,
    repaymentSchedule = 'one_time',
    paymentPlan,
}: ReviewStepProps) {
    const totalAmount = amount + taxAmount;

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Review your loan
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Please verify all details before creating the loan
                </p>
            </div>

            {/* Loan Details Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {/* Loan Type */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Loan Type</p>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">{loanType}</p>
                    </div>
                </div>

                {/* Borrower */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {loanType === 'personal' && 'Borrower'}
                            {loanType === 'business' && 'Customer'}
                            {loanType === 'group' && 'Group'}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">{borrowerName}</p>
                    </div>
                </div>

                {/* Amount */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                        {loanType === 'business' && taxRate > 0 ? (
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {currency} {amount.toFixed(2)}
                                </p>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    <p>Tax ({taxRate}%): {currency} {taxAmount.toFixed(2)}</p>
                                    <p className="font-semibold text-gray-900 dark:text-white mt-1">
                                        Total: {currency} {totalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {currency} {amount.toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Due Date */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(dueDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                        {loanType === 'business' && paymentTerms && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Payment Terms: {paymentTerms}
                            </p>
                        )}
                    </div>
                </div>

                {/* Payment Schedule */}
                {repaymentSchedule === 'installments' && paymentPlan && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Payment Schedule</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {paymentPlan.duration} installments
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {paymentPlan.frequency} • {paymentPlan.interestRate}% interest
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Notes */}
            <div>
                <Label htmlFor="note">Additional Notes (Optional)</Label>
                <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => onNoteChange(e.target.value)}
                    placeholder="Add any additional information about this loan..."
                    rows={4}
                    className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                    This information will be visible to you and the borrower
                </p>
            </div>
        </div>
    );
}

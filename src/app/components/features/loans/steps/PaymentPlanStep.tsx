/**
 * PaymentPlanStep - Fourth step: Configure payment plan (optional)
 */

import { PaymentPlanConfig } from '../../../PaymentPlanConfig';
import { Label } from '../../../ui/label';
import { cn } from '../../../ui/utils';
import type { PlanConfig } from '../../../../../lib/LoanCalculator';

interface PaymentPlanStepProps {
    amount: number;
    currency: string;
    dueDate: string;
    repaymentSchedule: 'one_time' | 'installments';
    onRepaymentScheduleChange: (schedule: 'one_time' | 'installments') => void;
    paymentPlan: PlanConfig | null;
    onPaymentPlanChange: (plan: PlanConfig | null) => void;
}

export function PaymentPlanStep({
    amount,
    currency,
    dueDate,
    repaymentSchedule,
    onRepaymentScheduleChange,
    paymentPlan,
    onPaymentPlanChange,
}: PaymentPlanStepProps) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Set up payment schedule
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Choose between one-time payment or installments
                </p>
            </div>

            {/* Repayment Schedule Toggle */}
            <div>
                <Label>Repayment Schedule</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                        type="button"
                        onClick={() => onRepaymentScheduleChange('one_time')}
                        className={cn(
                            'p-4 rounded-lg border-2 transition-all',
                            repaymentSchedule === 'one_time'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                : 'border-gray-200 dark:border-gray-700'
                        )}
                    >
                        <div className="text-center">
                            <h3 className="font-semibold text-gray-900 dark:text-white">One-Time Payment</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Full amount due on due date
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => onRepaymentScheduleChange('installments')}
                        className={cn(
                            'p-4 rounded-lg border-2 transition-all',
                            repaymentSchedule === 'installments'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                : 'border-gray-200 dark:border-gray-700'
                        )}
                    >
                        <div className="text-center">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Installments</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Split into multiple payments
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Payment Plan Configuration (if installments) */}
            {repaymentSchedule === 'installments' && (
                <div className="mt-6">
                    <PaymentPlanConfig
                        initialAmount={amount}
                        currency={currency}
                        dueDate={dueDate}
                        onPlanChange={onPaymentPlanChange}
                    />
                </div>
            )}

            {repaymentSchedule === 'one_time' && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Payment Due:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {new Date(dueDate).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-600 dark:text-gray-400">Amount Due:</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                            {currency} {amount.toFixed(2)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

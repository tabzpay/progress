/**
 * FinancialTermsStep - Third step: Amount, currency, due date, and payment terms
 */

import { DollarSign, Calendar } from 'lucide-react';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { cn } from '../../../ui/utils';
import { PAYMENT_TERMS_OPTIONS, type PaymentTerms } from '../../../../../lib/types/customer';

interface Currency {
    code: string;
    symbol: string;
    label: string;
    country: string;
}

const currencies: Currency[] = [
    { code: 'USD', symbol: '$', label: 'US Dollar', country: 'United States' },
    { code: 'EUR', symbol: '€', label: 'Euro', country: 'European Union' },
    { code: 'GBP', symbol: '£', label: 'British Pound', country: 'United Kingdom' },
    { code: 'NGN', symbol: '₦', label: 'Nigerian Naira', country: 'Nigeria' },
    { code: 'GHS', symbol: '₵', label: 'Ghanaian Cedi', country: 'Ghana' },
    { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling', country: 'Kenya' },
];

interface FinancialTermsStepProps {
    loanType: 'personal' | 'business' | 'group';
    amount: number;
    onAmountChange: (amount: number) => void;
    currency: string;
    onCurrencyChange: (currency: string) => void;
    dueDate: string;
    onDueDateChange: (date: string) => void;
    paymentTerms?: PaymentTerms;
    onPaymentTermsChange?: (terms: PaymentTerms) => void;
    taxRate?: number;
    onTaxRateChange?: (rate: number) => void;
    errors?: any;
}

export function FinancialTermsStep({
    loanType,
    amount,
    onAmountChange,
    currency,
    onCurrencyChange,
    dueDate,
    onDueDateChange,
    paymentTerms,
    onPaymentTermsChange,
    taxRate = 0,
    onTaxRateChange,
    errors,
}: FinancialTermsStepProps) {
    const selectedCurrency = currencies.find((c) => c.code === currency);
    const taxAmount = (amount * taxRate) / 100;
    const totalAmount = amount + taxAmount;

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Set the loan amount and terms
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Configure the financial details of this loan
                </p>
            </div>

            {/* Currency */}
            <div>
                <Label htmlFor="currency">Currency *</Label>
                <select
                    id="currency"
                    value={currency}
                    onChange={(e) => onCurrencyChange(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                    {currencies.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                            {curr.symbol} {curr.label} ({curr.country})
                        </option>
                    ))}
                </select>
            </div>

            {/* Amount */}
            <div>
                <Label htmlFor="amount">Loan Amount *</Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {selectedCurrency?.symbol}
                    </div>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={amount || ''}
                        onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={cn('pl-8', errors?.amount && 'border-red-500')}
                    />
                </div>
                {errors?.amount && (
                    <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
                )}
            </div>

            {/* Business-specific: Payment Terms & Tax */}
            {loanType === 'business' && (
                <>
                    <div>
                        <Label htmlFor="payment_terms">Payment Terms *</Label>
                        <select
                            id="payment_terms"
                            value={paymentTerms}
                            onChange={(e) => onPaymentTermsChange?.(e.target.value as PaymentTerms)}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        >
                            {PAYMENT_TERMS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Due date will be automatically calculated based on payment terms
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                        <Input
                            id="tax_rate"
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={taxRate || ''}
                            onChange={(e) => onTaxRateChange?.(parseFloat(e.target.value) || 0)}
                            placeholder="0.0"
                        />
                        {taxRate > 0 && (
                            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Principal:</span>
                                    <span className="font-medium">
                                        {selectedCurrency?.symbol}
                                        {amount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-gray-600 dark:text-gray-400">Tax ({taxRate}%):</span>
                                    <span className="font-medium">
                                        {selectedCurrency?.symbol}
                                        {taxAmount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between mt-1 pt-2 border-t border-blue-200 dark:border-blue-800">
                                    <span className="font-semibold">Total Amount:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                        {selectedCurrency?.symbol}
                                        {totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Due Date */}
            <div>
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                    id="due_date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => onDueDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={cn(errors?.due_date && 'border-red-500')}
                    disabled={loanType === 'business'} // Auto-calculated for business loans
                />
                {errors?.due_date && (
                    <p className="text-sm text-red-600 mt-1">{errors.due_date.message}</p>
                )}
                {loanType === 'business' && (
                    <p className="text-xs text-gray-500 mt-1">
                        Auto-calculated from payment terms
                    </p>
                )}
            </div>
        </div>
    );
}

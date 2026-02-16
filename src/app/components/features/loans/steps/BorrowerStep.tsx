/**
 * BorrowerStep - Second step: Select or enter borrower/customer/group
 */

import { useState } from 'react';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { CustomerSelector } from '../../../CustomerSelector';
import type { Customer } from '../../../../../lib/types/customer';
import { cn } from '../../../ui/utils';

interface BorrowerStepProps {
    loanType: 'personal' | 'business' | 'group';
    borrowerName: string;
    onBorrowerNameChange: (name: string) => void;
    selectedCustomer: Customer | null;
    onCustomerChange: (customer: Customer | null) => void;
    groups?: any[];
    selectedGroupId?: string | null;
    onGroupChange?: (groupId: string) => void;
    errors?: any;
}

export function BorrowerStep({
    loanType,
    borrowerName,
    onBorrowerNameChange,
    selectedCustomer,
    onCustomerChange,
    groups = [],
    selectedGroupId,
    onGroupChange,
    errors,
}: BorrowerStepProps) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {loanType === 'personal' && 'Who are you lending to?'}
                    {loanType === 'business' && 'Select your customer'}
                    {loanType === 'group' && 'Which group is this for?'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    {loanType === 'personal' && 'Enter the name of the person'}
                    {loanType === 'business' && 'Choose an existing customer or create a new one'}
                    {loanType === 'group' && 'Select the group for this loan'}
                </p>
            </div>

            {/* Personal Loan - Simple name input */}
            {loanType === 'personal' && (
                <div>
                    <Label htmlFor="borrower_name">Borrower Name *</Label>
                    <Input
                        id="borrower_name"
                        type="text"
                        value={borrowerName}
                        onChange={(e) => onBorrowerNameChange(e.target.value)}
                        placeholder="Enter borrower's full name"
                        className={cn(errors?.borrower_name && 'border-red-500')}
                    />
                    {errors?.borrower_name && (
                        <p className="text-sm text-red-600 mt-1">{errors.borrower_name.message}</p>
                    )}
                </div>
            )}

            {/* Business Loan - Customer selector */}
            {loanType === 'business' && (
                <div>
                    <Label>Customer *</Label>
                    <CustomerSelector
                        value={selectedCustomer}
                        onChange={(customer) => {
                            onCustomerChange(customer);
                            if (customer) {
                                const displayName =
                                    customer.company_name || `${customer.first_name} ${customer.last_name}`.trim();
                                onBorrowerNameChange(displayName);
                            }
                        }}
                    />
                    {errors?.borrower_name && (
                        <p className="text-sm text-red-600 mt-1">{errors.borrower_name.message}</p>
                    )}
                </div>
            )}

            {/* Group Loan - Group selector */}
            {loanType === 'group' && (
                <div>
                    <Label htmlFor="group">Select Group *</Label>
                    <select
                        id="group"
                        value={selectedGroupId || ''}
                        onChange={(e) => {
                            onGroupChange?.(e.target.value);
                            const group = groups.find((g) => g.id === e.target.value);
                            if (group) {
                                onBorrowerNameChange(group.name);
                            }
                        }}
                        className={cn(
                            'w-full px-4 py-2 border rounded-lg',
                            'dark:bg-gray-800 dark:border-gray-700',
                            !selectedGroupId && 'text-gray-400'
                        )}
                    >
                        <option value="">Select a group...</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name} ({group.members?.length || 0} members)
                            </option>
                        ))}
                    </select>
                    {!selectedGroupId && errors?.borrower_name && (
                        <p className="text-sm text-red-600 mt-1">Please select a group</p>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * LoanTypeStep - First step: Select loan type
 */

import { User, Briefcase, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../ui/utils';

export type LoanType = 'personal' | 'business' | 'group';

interface LoanTypeStepProps {
    selectedType: LoanType;
    onTypeChange: (type: LoanType) => void;
}

const loanTypes: { value: LoanType; label: string; description: string; icon: any; color: string }[] = [
    {
        value: 'personal',
        label: 'Personal',
        description: 'Lending to friends or family',
        icon: User,
        color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
        value: 'business',
        label: 'Business',
        description: 'Customer or supplier loans',
        icon: Briefcase,
        color: 'bg-gradient-to-br from-amber-500 to-amber-600',
    },
    {
        value: 'group',
        label: 'Group',
        description: 'Rotating savings groups',
        icon: Users,
        color: 'bg-gradient-to-br from-violet-500 to-violet-600',
    },
];

export function LoanTypeStep({ selectedType, onTypeChange }: LoanTypeStepProps) {
    return (
        <div className="space-y-4">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    What type of loan are you creating?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Choose the loan type that best fits your needs
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loanTypes.map((loanType) => {
                    const Icon = loanType.icon;
                    const isSelected = selectedType === loanType.value;

                    return (
                        <motion.button
                            key={loanType.value}
                            type="button"
                            onClick={() => onTypeChange(loanType.value)}
                            className={cn(
                                'relative p-6 rounded-xl border-2 transition-all duration-200',
                                'hover:shadow-lg hover:scale-105',
                                isSelected
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                            )}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className={cn('p-4 rounded-full', loanType.color)}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                        {loanType.label}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {loanType.description}
                                    </p>
                                </div>
                            </div>

                            {isSelected && (
                                <motion.div
                                    className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

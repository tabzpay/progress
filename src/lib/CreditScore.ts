import { supabase } from './supabase';

export type CreditTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface CreditScoreResult {
    score: number;
    tier: CreditTier;
    trend: TrendDirection;
    factors: {
        onTimePaymentRate: number;
        loanCompletionRate: number;
        totalVolumeNormalized: number;
        relationshipDuration: number;
    };
}

interface LoanRecord {
    id: string;
    amount: number;
    status: string;
    due_date: string;
    created_at: string;
    repayments: Array<{
        amount: number;
        date: string;
    }>;
}

/**
 * Calculate credit score for a borrower based on loan history
 * Algorithm weights:
 * - On-time payment rate: 40%
 * - Loan completion rate: 30%
 * - Total volume processed: 20%
 * - Relationship duration: 10%
 */
export async function calculateCreditScore(borrowerId: string | null): Promise<CreditScoreResult> {
    const defaultScore: CreditScoreResult = {
        score: 0,
        tier: "Bronze",
        factors: { onTimePaymentRate: 0, loanCompletionRate: 0, totalVolumeNormalized: 0, relationshipDuration: 0 },
        trend: "stable"
    };

    if (!borrowerId || borrowerId === 'null' || borrowerId === 'undefined') {
        return defaultScore;
    }

    // Fetch all loans for this borrower
    const { data: loans, error } = await supabase
        .from('loans')
        .select(`
      id,
      amount,
      status,
      due_date,
      created_at
    `)
        .eq('borrower_id', borrowerId);

    if (error) {
        console.error('Error fetching loans for credit score:', error);
        throw error;
    }

    // Fetch all repayments for these loans
    const loanIds = (loans || []).map(l => l.id);
    const { data: repayments } = await supabase
        .from('repayments')
        .select('loan_id, amount, date')
        .in('loan_id', loanIds);

    // Map repayments to loans
    const loansWithRepayments: LoanRecord[] = (loans || []).map(loan => ({
        ...loan,
        repayments: (repayments || [])
            .filter(r => r.loan_id === loan.id)
            .map(r => ({ amount: r.amount, date: r.date }))
    }));

    // Handle edge case: new borrower with no history
    if (loansWithRepayments.length === 0) {
        return {
            score: 0,
            tier: 'Bronze',
            trend: 'stable',
            factors: {
                onTimePaymentRate: 0,
                loanCompletionRate: 0,
                totalVolumeNormalized: 0,
                relationshipDuration: 0
            }
        };
    }

    // 1. Calculate on-time payment rate (40% weight)
    const onTimePaymentRate = calculateOnTimePaymentRate(loansWithRepayments);

    // 2. Calculate loan completion rate (30% weight)
    const loanCompletionRate = calculateLoanCompletionRate(loansWithRepayments);

    // 3. Calculate total volume normalized (20% weight)
    const totalVolumeNormalized = calculateVolumeScore(loansWithRepayments);

    // 4. Calculate relationship duration (10% weight)
    const relationshipDuration = calculateRelationshipDuration(loansWithRepayments);

    // Calculate weighted score
    const score = Math.round(
        onTimePaymentRate * 0.4 +
        loanCompletionRate * 0.3 +
        totalVolumeNormalized * 0.2 +
        relationshipDuration * 0.1
    );

    // Determine tier
    const tier = determineTier(score);

    // Determine trend (simplified - would need historical scores for true trend)
    const trend = determineTrend(score);

    return {
        score,
        tier,
        trend,
        factors: {
            onTimePaymentRate,
            loanCompletionRate,
            totalVolumeNormalized,
            relationshipDuration
        }
    };
}

/**
 * Calculate percentage of payments made on time
 */
function calculateOnTimePaymentRate(loans: LoanRecord[]): number {
    let totalPayments = 0;
    let onTimePayments = 0;

    for (const loan of loans) {
        for (const repayment of loan.repayments) {
            totalPayments++;
            const paymentDate = new Date(repayment.date);
            const dueDate = new Date(loan.due_date);

            // Consider on-time if paid before or on due date
            if (paymentDate <= dueDate) {
                onTimePayments++;
            }
        }
    }

    // Edge case: no payments yet
    if (totalPayments === 0) {
        return 50; // Neutral score
    }

    return Math.round((onTimePayments / totalPayments) * 100);
}

/**
 * Calculate percentage of loans fully completed
 */
function calculateLoanCompletionRate(loans: LoanRecord[]): number {
    const completedLoans = loans.filter(l => l.status === 'COMPLETED' || l.status === 'completed').length;

    // Edge case: all loans still active
    if (loans.length === 0) {
        return 0;
    }

    return Math.round((completedLoans / loans.length) * 100);
}

/**
 * Calculate score based on total volume handled
 * Normalized to 0-100 scale (higher volume = better score, capped)
 */
function calculateVolumeScore(loans: LoanRecord[]): number {
    const totalVolume = loans.reduce((sum, loan) => sum + Number(loan.amount), 0);

    // Normalize: $0-$10,000 scale to 0-100
    // Adjust multiplier based on your typical loan sizes
    const normalizedScore = Math.min((totalVolume / 10000) * 100, 100);

    return Math.round(normalizedScore);
}

/**
 * Calculate score based on relationship duration in months
 * Normalized to 0-100 scale (longer = better, capped at 24 months)
 */
function calculateRelationshipDuration(loans: LoanRecord[]): number {
    if (loans.length === 0) return 0;

    // Find earliest loan
    const earliestLoan = loans.reduce((earliest, loan) => {
        const loanDate = new Date(loan.created_at);
        const earliestDate = new Date(earliest.created_at);
        return loanDate < earliestDate ? loan : earliest;
    });

    const firstLoanDate = new Date(earliestLoan.created_at);
    const now = new Date();
    const monthsDiff = (now.getTime() - firstLoanDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    // Normalize: 0-24 months scale to 0-100
    const normalizedScore = Math.min((monthsDiff / 24) * 100, 100);

    return Math.round(normalizedScore);
}

/**
 * Determine credit tier based on score
 */
function determineTier(score: number): CreditTier {
    if (score >= 85) return 'Platinum';
    if (score >= 70) return 'Gold';
    if (score >= 50) return 'Silver';
    return 'Bronze';
}

/**
 * Determine trend direction
 * Simplified version - in production would compare to previous score
 */
function determineTrend(score: number): TrendDirection {
    // For now, return stable
    // TODO: Implement historical score tracking to determine actual trend
    if (score >= 70) return 'up';
    if (score <= 40) return 'down';
    return 'stable';
}

/**
 * Get tier color for UI styling
 */
export function getTierColor(tier: CreditTier): string {
    const colors: Record<CreditTier, string> = {
        Bronze: '#CD7F32',
        Silver: '#C0C0C0',
        Gold: '#FFD700',
        Platinum: '#E5E4E2'
    };
    return colors[tier];
}

/**
 * Get tier description
 */
export function getTierDescription(tier: CreditTier): string {
    const descriptions: Record<CreditTier, string> = {
        Bronze: 'Building credit history',
        Silver: 'Good payment track record',
        Gold: 'Excellent borrower standing',
        Platinum: 'Outstanding credit performance'
    };
    return descriptions[tier];
}

import { supabase } from './supabase';

export interface TrendData {
    name: string; // Month name (e.g., "Jan", "Feb")
    amount: number;
}

export interface CashFlowData {
    name: string; // Month name
    inflow: number; // Repayments received
    outflow: number; // Loans disbursed
}

export interface DefaultRateData {
    totalLoans: number;
    overdueLoans: number;
    defaultRate: number; // Percentage
}

export interface StatusDistribution {
    name: string; // Status name (Active, Completed, Overdue, Partial)
    value: number; // Count
}

export interface BorrowerConcentration {
    name: string; // Borrower name
    amount: number; // Total amount lent to this borrower
}

/**
 * Get lending trends for the past N months
 */
export async function getLendingTrends(
    userId: string,
    months: number = 6
): Promise<TrendData[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data: loans, error } = await supabase
        .from('loans')
        .select('amount, created_at')
        .eq('lender_id', userId)
        .gte('created_at', startDate.toISOString());

    if (error) {
        console.error('Error fetching lending trends:', error);
        return [];
    }

    // Group by month
    const monthlyData: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize all months with 0
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        monthlyData[key] = 0;
    }

    // Aggregate loan amounts by month
    (loans || []).forEach(loan => {
        const date = new Date(loan.created_at);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        if (monthlyData[key] !== undefined) {
            monthlyData[key] += Number(loan.amount);
        }
    });

    return Object.entries(monthlyData).map(([name, amount]) => ({
        name,
        amount
    }));
}

/**
 * Get cash flow data (inflow vs outflow) for the past N months
 */
export async function getCashFlowData(
    userId: string,
    months: number = 6
): Promise<CashFlowData[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Fetch loans (outflow)
    const { data: loans } = await supabase
        .from('loans')
        .select('amount, created_at')
        .eq('lender_id', userId)
        .gte('created_at', startDate.toISOString());

    // Fetch repayments (inflow)
    // First get loan IDs
    const { data: userLoans } = await supabase
        .from('loans')
        .select('id')
        .eq('lender_id', userId);

    const loanIds = (userLoans || []).map(l => l.id);

    const { data: repayments } = await supabase
        .from('repayments')
        .select('amount, date')
        .in('loan_id', loanIds)
        .gte('date', startDate.toISOString());

    // Group by month
    const monthlyData: Record<string, { inflow: number; outflow: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize all months
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        monthlyData[key] = { inflow: 0, outflow: 0 };
    }

    // Aggregate outflow (loans disbursed)
    (loans || []).forEach(loan => {
        const date = new Date(loan.created_at);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        if (monthlyData[key]) {
            monthlyData[key].outflow += Number(loan.amount);
        }
    });

    // Aggregate inflow (repayments received)
    (repayments || []).forEach(repayment => {
        const date = new Date(repayment.date);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        if (monthlyData[key]) {
            monthlyData[key].inflow += Number(repayment.amount);
        }
    });

    return Object.entries(monthlyData).map(([name, data]) => ({
        name,
        inflow: data.inflow,
        outflow: data.outflow
    }));
}

/**
 * Get default/overdue rate statistics
 */
export async function getDefaultRates(userId: string): Promise<DefaultRateData> {
    const { data: loans, error } = await supabase
        .from('loans')
        .select('id, status, due_date')
        .eq('lender_id', userId);

    if (error) {
        console.error('Error fetching default rates:', error);
        return { totalLoans: 0, overdueLoans: 0, defaultRate: 0 };
    }

    const totalLoans = (loans || []).length;
    const now = new Date();

    // Count overdue loans (status='OVERDUE' or past due date with status not 'COMPLETED')
    const overdueLoans = (loans || []).filter(loan => {
        if (loan.status === 'OVERDUE' || loan.status === 'overdue') return true;

        const dueDate = new Date(loan.due_date);
        const isOverdue = dueDate < now && !['COMPLETED', 'completed'].includes(loan.status);
        return isOverdue;
    }).length;

    const defaultRate = totalLoans > 0 ? (overdueLoans / totalLoans) * 100 : 0;

    return {
        totalLoans,
        overdueLoans,
        defaultRate: Math.round(defaultRate * 10) / 10 // Round to 1 decimal
    };
}

/**
 * Get loan status distribution
 */
export async function getStatusDistribution(userId: string): Promise<StatusDistribution[]> {
    const { data: loans, error } = await supabase
        .from('loans')
        .select('status')
        .eq('lender_id', userId);

    if (error) {
        console.error('Error fetching status distribution:', error);
        return [];
    }

    // Count by status
    const statusCounts: Record<string, number> = {
        Active: 0,
        Completed: 0,
        Overdue: 0,
        Partial: 0,
        Pending: 0
    };

    (loans || []).forEach(loan => {
        const status = loan.status.toLowerCase();
        if (status === 'active') statusCounts.Active++;
        else if (status === 'completed') statusCounts.Completed++;
        else if (status === 'overdue') statusCounts.Overdue++;
        else if (status === 'partial') statusCounts.Partial++;
        else if (status === 'pending') statusCounts.Pending++;
    });

    // Convert to array format for charts
    return Object.entries(statusCounts)
        .filter(([_, value]) => value > 0) // Only include non-zero statuses
        .map(([name, value]) => ({ name, value }));
}

/**
 * Get top borrowers by total amount lent
 */
export async function getBorrowerConcentration(
    userId: string,
    limit: number = 5
): Promise<BorrowerConcentration[]> {
    const { data: loans, error } = await supabase
        .from('loans')
        .select('borrower_name, amount')
        .eq('lender_id', userId);

    if (error) {
        console.error('Error fetching borrower concentration:', error);
        return [];
    }

    // Aggregate by borrower
    const borrowerTotals: Record<string, number> = {};

    (loans || []).forEach(loan => {
        const name = loan.borrower_name || 'Unknown';
        borrowerTotals[name] = (borrowerTotals[name] || 0) + Number(loan.amount);
    });

    // Convert to array and sort
    const sortedBorrowers = Object.entries(borrowerTotals)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, limit);

    return sortedBorrowers;
}

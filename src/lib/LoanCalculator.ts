import { addDays, addWeeks, addMonths, startOfDay } from "date-fns";

export type InstallmentFrequency = "weekly" | "bi_weekly" | "monthly";
export type InterestType = "simple" | "compound";

export interface PlanConfig {
    amount: number;
    frequency: InstallmentFrequency;
    duration: number; // Duration in number of installments
    interestRate: number; // Annual interest rate in percentage (e.g., 5 for 5%)
    interestType: InterestType;
    startDate: Date;
}

export interface Installment {
    number: number;
    dueDate: Date;
    amount: number;
    principal: number;
    interest: number;
    balance: number;
}

export function calculateInstallments(config: PlanConfig): Installment[] {
    const { amount, frequency, duration, interestRate, interestType, startDate } = config;

    if (duration <= 0 || amount <= 0) return [];

    const installments: Installment[] = [];
    let remainingBalance = amount;

    // Calculate Interest
    let totalInterest = 0;
    let totalAmount = amount;

    // Periods per year
    const periodsPerYear = frequency === "weekly" ? 52 : frequency === "bi_weekly" ? 26 : 12;

    // Rate per period
    const ratePerPeriod = (interestRate / 100) / periodsPerYear;


    if (interestType === "simple") {
        // Simple Interest: P * r * t (where t is in years)
        const durationInYears = duration / periodsPerYear;
        totalInterest = amount * (interestRate / 100) * durationInYears;
        totalAmount = amount + totalInterest;
    } else {
        // Compound Interest: P * (1 + r/n)^(nt) - P
        // Here we treat each installment as a compounding period
        totalAmount = amount * Math.pow(1 + ratePerPeriod, duration);
        totalInterest = totalAmount - amount;
    }

    const installmentAmount = totalAmount / duration;

    // Round to 2 decimal places to avoid floating point issues
    const roundedInstallmentAmount = Math.round(installmentAmount * 100) / 100;

    // Handle rounding differences in the final installment
    let totalCalculated = 0;

    for (let i = 1; i <= duration; i++) {
        let dueDate = startOfDay(new Date(startDate));

        if (frequency === "weekly") {
            dueDate = addWeeks(dueDate, i);
        } else if (frequency === "bi_weekly") {
            dueDate = addWeeks(dueDate, i * 2);
        } else {
            dueDate = addMonths(dueDate, i);
        }

        let currentAmount = roundedInstallmentAmount;

        // Adjust last payment
        if (i === duration) {
            currentAmount = Math.round((totalAmount - totalCalculated) * 100) / 100;
        }

        totalCalculated += currentAmount;

        // Simple breakdown (approximate for display)
        const interestPart = currentAmount - (amount / duration);
        const principalPart = amount / duration;

        installments.push({
            number: i,
            dueDate: dueDate,
            amount: currentAmount,
            principal: principalPart,
            interest: interestPart,
            balance: Math.max(0, totalAmount - totalCalculated)
        });
    }

    return installments;
}

export function calculateTotalRepayment(config: PlanConfig): number {
    const installments = calculateInstallments(config);
    return installments.reduce((sum, inst) => sum + inst.amount, 0);
}

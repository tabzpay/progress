import { useState, useEffect } from "react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Calendar, DollarSign, Percent, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PlanConfig, calculateInstallments, Installment } from "../../../../lib/LoanCalculator";
import { cn } from "../../ui/utils";

interface PaymentPlanConfigProps {
    amount: number;
    startDate: Date;
    onChange: (config: PlanConfig) => void;
}

export function PaymentPlanConfig({ amount, startDate, onChange }: PaymentPlanConfigProps) {
    const [frequency, setFrequency] = useState<PlanConfig["frequency"]>("monthly");
    const [duration, setDuration] = useState(1);
    const [interestRate, setInterestRate] = useState(0);
    const [interestType, setInterestType] = useState<PlanConfig["interestType"]>("simple");
    const [showSchedule, setShowSchedule] = useState(false);
    const [installments, setInstallments] = useState<Installment[]>([]);

    useEffect(() => {
        const config: PlanConfig = {
            amount,
            frequency,
            duration,
            interestRate,
            interestType,
            startDate
        };

        setInstallments(calculateInstallments(config));
        onChange(config);
    }, [amount, frequency, duration, interestRate, interestType, startDate]);

    const totalRepayment = installments.reduce((sum, i) => sum + i.amount, 0);
    const totalInterest = totalRepayment - amount;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Frequency & Duration */}
                <div className="space-y-4">
                    <div>
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Repayment Frequency</Label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {(['weekly', 'bi_weekly', 'monthly'] as const).map((freq) => (
                                <button
                                    key={freq}
                                    onClick={() => setFrequency(freq)}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all",
                                        frequency === freq ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {freq.replace('_', '-')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                            Duration ({frequency === 'monthly' ? 'Months' : 'Weeks'})
                        </Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                type="number"
                                min={1}
                                max={52}
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="pl-10 h-10 bg-slate-50 rounded-xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Interest Configuration */}
                <div className="space-y-4">
                    <div>
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Annual Interest Rate (%)</Label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                type="number"
                                min={0}
                                step={0.1}
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                className="pl-10 h-10 bg-slate-50 rounded-xl"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Interest Type</Label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {(['simple', 'compound'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setInterestType(type)}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all",
                                        interestType === type ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500">Total Repayment</span>
                    <span className="text-lg font-black text-slate-900">${totalRepayment.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-500">Total Interest</span>
                    <span className="text-sm font-bold text-emerald-600">+${totalInterest.toFixed(2)}</span>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <Button
                        variant="ghost"
                        onClick={() => setShowSchedule(!showSchedule)}
                        className="w-full flex items-center justify-between text-indigo-600 hover:bg-indigo-50"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest">View Schedule Preview</span>
                        {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                </div>

                <AnimatePresence>
                    {showSchedule && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                                {installments.map((inst) => (
                                    <div key={inst.number} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-400">#{inst.number}</span>
                                            <span className="text-slate-600">{inst.dueDate.toLocaleDateString()}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">${inst.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react";
import { cn } from "./ui/utils";
import { format } from "date-fns";
import { motion } from "motion/react";

interface Installment {
    id: string;
    installment_number: number;
    due_date: string;
    amount_due: number;
    amount_paid: number;
    status: 'pending' | 'paid' | 'partially_paid' | 'overdue';
}

interface InstallmentListProps {
    loanId: string;
    currency: string;
    refreshTrigger?: number;
}

export function InstallmentList({ loanId, currency, refreshTrigger = 0 }: InstallmentListProps) {
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInstallments();
    }, [loanId, refreshTrigger]);

    async function fetchInstallments() {
        try {
            const { data, error } = await supabase
                .from('installments')
                .select('*')
                .eq('loan_id', loanId)
                .order('installment_number', { ascending: true });

            if (error) throw error;
            setInstallments(data || []);
        } catch (error) {
            console.error("Error fetching installments:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Schedule...</div>;
    }

    if (installments.length === 0) {
        return null; // Don't show anything if no installments (e.g. one-time loan)
    }

    const paidCount = installments.filter(i => i.status === 'paid').length;
    const progress = (paidCount / installments.length) * 100;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black tracking-tight text-slate-900">Payment Schedule</h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {paidCount} / {installments.length} Paid
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-emerald-500 rounded-full"
                />
            </div>

            <div className="space-y-3">
                {installments.map((inst) => {
                    const isPaid = inst.status === 'paid';
                    const isOverdue = inst.status === 'overdue';

                    return (
                        <div
                            key={inst.id}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                isPaid ? "bg-emerald-50/50 border-emerald-100" :
                                    isOverdue ? "bg-red-50/50 border-red-100" : "bg-white border-slate-100"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black",
                                    isPaid ? "bg-emerald-100 text-emerald-600" :
                                        isOverdue ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
                                )}>
                                    {inst.installment_number}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">
                                        {formatAmount(inst.amount_due)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {format(new Date(inst.due_date), "MMM d, yyyy")}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                {isPaid ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                                    </span>
                                ) : isOverdue ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider">
                                        <AlertCircle className="w-3.5 h-3.5" /> Overdue
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                                        <Clock className="w-3.5 h-3.5" /> Due
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

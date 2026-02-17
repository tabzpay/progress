import { motion } from 'motion/react';
import { Calendar, ArrowRight, CreditCard, Clock } from 'lucide-react';
import { cn } from "../../ui/utils";

interface Installment {
    id: string;
    loan_id: string;
    borrower_name: string;
    amount_due: number;
    amount_paid: number;
    due_date: string;
    installment_number: number;
    currency: string;
    status: string;
}

interface RepaymentTimelineProps {
    installments: Installment[];
    onPay: (installment: Installment) => void;
    className?: string;
}

export function RepaymentTimeline({ installments, onPay, className }: RepaymentTimelineProps) {
    const formatAmount = (num: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const isUrgent = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    };

    if (installments.length === 0) {
        return null;
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] items-center gap-1.5 flex uppercase font-bold tracking-widest text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Upcoming Repayments
                </h2>
                <span className="text-[9px] font-bold text-muted-foreground/50 bg-muted px-2 py-0.5 rounded-full">
                    {installments.length} Pending
                </span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                {installments.map((inst, index) => {
                    const urgent = isUrgent(inst.due_date);
                    const remaining = inst.amount_due - inst.amount_paid;

                    return (
                        <motion.div
                            key={inst.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4 }}
                            className={cn(
                                "shrink-0 w-72 bg-card border rounded-3xl p-5 shadow-sm transition-all relative overflow-hidden group",
                                urgent ? "border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/10" : "border-border hover:border-primary/20"
                            )}
                        >
                            {/* Urgent Glow */}
                            {urgent && (
                                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl pointer-events-none" />
                            )}

                            <div className="flex items-center justify-between mb-4">
                                <div className={cn(
                                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                    urgent ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" : "bg-muted text-muted-foreground"
                                )}>
                                    Installment #{inst.installment_number}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(inst.due_date)}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mb-1">Amount Due</p>
                                        <h3 className="text-2xl font-black tabular-nums tracking-tighter">
                                            {formatAmount(remaining, inst.currency)}
                                        </h3>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onPay(inst)}
                                        className={cn(
                                            "p-3 rounded-2xl shadow-lg transition-all",
                                            urgent ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-primary text-primary-foreground shadow-primary/20"
                                        )}
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                            <CreditCard className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                        <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[120px]">
                                            Loan for {inst.borrower_name}
                                        </span>
                                    </div>
                                    {urgent && (
                                        <span className="text-[9px] font-black text-rose-500 uppercase animate-pulse">
                                            Pay soon
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

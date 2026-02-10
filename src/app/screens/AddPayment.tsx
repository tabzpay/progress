import { useState } from "react";
import { ArrowLeft, DollarSign, Wallet, Calendar, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { SuccessOverlay } from "../components/SuccessOverlay";
import { mockLoans, currentUser } from "../data/mockData";
import { ProgressBar } from "../components/ProgressBar";
import { cn } from "../components/ui/utils";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentSchema, type PaymentFormData } from "../../lib/schemas";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export function AddPayment() {
  const navigate = useNavigate();
  const { loanId } = useParams();
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [loan, setLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      amount: 0,
      note: "",
    },
  });

  const amount = watch("amount");

  useEffect(() => {
    fetchLoanData();
  }, [loanId]);

  async function fetchLoanData() {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const { data, error } = await supabase
        .from('loans')
        .select('*, repayments(*)')
        .eq('id', loanId)
        .single();

      if (error) throw error;
      setLoan(data);
    } catch (error: any) {
      console.error("Error fetching loan:", error);
      toast.error("Failed to load record");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Verifying active records...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl mb-2 font-bold font-black tracking-tight">Loan not found</h2>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isLender = loan.lender_id === userId;
  const otherPartyName = isLender ? loan.borrower_name : "Lender";

  const paidAmount = loan.repayments?.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0) || 0;
  const currentRemainingBalance = Math.max(0, loan.amount - paidAmount);

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: loan.currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    if (data.amount > currentRemainingBalance) {
      setError("amount", { message: "Payment exceeds remaining balance" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('repayments')
        .insert([{
          loan_id: loanId,
          amount: data.amount,
          note: data.note || "Manual Payment Record"
        }]);

      if (insertError) throw insertError;

      // If fully paid, update loan status
      if (data.amount >= currentRemainingBalance) {
        await supabase
          .from('loans')
          .update({ status: 'PAID' })
          .eq('id', loanId);
      }

      // Create notification for other party
      const targetUserId = isLender ? loan.borrower_id : loan.lender_id;
      if (targetUserId) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: targetUserId,
            title: "Payment Received",
            message: `${isLender ? "You" : otherPartyName} logged a payment of ${_getCurrencySymbol(loan.currency)}${data.amount}.`,
            type: 'payment',
            link_to: `/loan/${loanId}`
          }]);
      }

      setIsSuccessOpen(true);
      toast.success("Payment successfully logged");
    } catch (error: any) {
      console.error("Error saving payment:", error);
      toast.error(error.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [
    Math.min(100, currentRemainingBalance),
    Math.min(currentRemainingBalance / 2, currentRemainingBalance),
    currentRemainingBalance,
  ].filter((amt, idx, arr) => amt > 0 && arr.indexOf(amt) === idx);

  const remainingBalanceAfter = currentRemainingBalance - (amount || 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Premium Header */}
      <header className="relative overflow-hidden pt-8 pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-[60px]"
          />
        </div>

        <div className="max-w-xl mx-auto relative z-10 text-white text-center">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0"
              onClick={() => navigate(`/loan/${loanId}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Record Payment</h1>
              <p className="text-white/60 text-[10px] uppercase font-black tracking-widest mt-0.5">Payment for #{loan.id.slice(0, 8)}</p>
            </div>
            <div className="w-10 h-10" /> {/* Spacer */}
          </div>

          <div className="relative inline-block">
            <div className="text-[11px] uppercase font-black tracking-[0.2em] text-white/50 mb-1">Enter Amount</div>
            <motion.div
              animate={errors.amount ? { x: [-5, 5, -5, 5, 0] } : {}}
              className="flex items-center justify-center gap-1"
            >
              <span className={cn(
                "text-4xl font-black tabular-nums transition-colors",
                errors.amount ? "text-rose-300" : "text-white/40"
              )}>{_getCurrencySymbol(loan.currency || "USD")}</span>
              <input
                type="number"
                placeholder="0"
                {...register("amount", {
                  onChange: (e) => {
                    if (errors.amount) clearErrors("amount");
                  }
                })}
                className={cn(
                  "bg-transparent border-none focus:outline-none text-7xl font-black tracking-tighter placeholder:text-white/20 w-[240px] text-center tabular-nums transition-colors",
                  errors.amount ? "text-rose-100" : "text-white"
                )}
                autoFocus
              />
            </motion.div>
            <AnimatePresence>
              {errors.amount && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap mt-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg"
                >
                  {errors.amount.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 -mt-16 relative z-20">
        <div className="space-y-6">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-black tracking-widest text-slate-400 mb-0.5">Remaining Balance</div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">{formatAmount(loan.remainingAmount)}</div>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(paidAmount / loan.amount) * 100}%` }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
          </motion.div>

          {/* Quick Preset Amounts */}
          {quickAmounts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-[11px] uppercase font-black tracking-[0.15em] text-slate-400 ml-4">Quick Presets</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {quickAmounts.map((amt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setValue("amount", amt);
                      if (errors.amount) clearErrors("amount");
                    }}
                    className={cn(
                      "px-6 h-14 rounded-2xl font-black transition-all shadow-sm border shrink-0",
                      amount === amt
                        ? "bg-slate-900 text-white border-slate-900 scale-95 shadow-lg"
                        : "bg-white text-slate-900 border-slate-200 hover:border-indigo-300"
                    )}
                  >
                    {formatAmount(amt)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Note Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-[11px] uppercase font-black tracking-[0.15em] text-slate-400 ml-4">Payment Note</h3>
            <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 focus-within:border-indigo-400 transition-colors shadow-sm">
              <textarea
                id="note"
                placeholder="What is this payment for? (optional)"
                {...register("note")}
                className="w-full bg-transparent border-none focus:outline-none text-slate-600 font-medium resize-none h-24"
              />
            </div>
          </motion.div>

          {/* New Balance Preview */}
          <AnimatePresence>
            {amount && parseFloat(amount) > 0 && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase font-black tracking-widest text-emerald-700/60 mb-0.5">Remaining after payment</div>
                    <div className="text-2xl font-black text-emerald-900 tabular-nums">
                      {formatAmount(Math.max(0, remainingBalanceAfter))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Context Alert */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-3 px-6"
          >
            <Info className="w-4 h-4 text-slate-400 mt-0.5" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
              This payment will be recorded instantly and notify {otherPartyName}.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-0 right-0 px-6 z-50">
        <div className="max-w-xl mx-auto">
          <Button
            className="w-full h-18 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all py-8"
            onClick={handleSubmit(handlePaymentSubmit)}
            disabled={!amount || amount <= 0 || isSubmitting}
          >
            {isSubmitting ? "Saving Record..." : "Record Payment Detail"}
          </Button>
        </div>
      </div>

      <SuccessOverlay
        isOpen={isSuccessOpen}
        onClose={() => navigate(`/loan/${loanId}`)}
        onAction={() => navigate(`/loan/${loanId}`)}
        title="Payment Recorded!"
        message="The payment has been successfully logged against this loan."
        type="emerald"
        details={[
          { label: "Amount Paid", value: formatAmount(amount || 0) },
          { label: "Remaining", value: formatAmount(Math.max(0, remainingBalanceAfter)) },
          { label: "Recipient", value: otherPartyName }
        ]}
        actionLabel="Back to Loan Details"
      />
    </div>
  );
}

// Helper to get currency symbol (could be moved to global utils)
function _getCurrencySymbol(code: string) {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", NGN: "₦", GHS: "₵", KES: "KSh"
  };
  return symbols[code] || "$";
}

import { ArrowLeft, Calendar, Bell, Plus, TrendingUp, DollarSign, History, MessageSquare, Send, CheckCircle2, UserPlus, Briefcase, FileText, X, Download, CreditCard } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { StatusTag } from "../components/features/loans/StatusTag";
import { SuccessOverlay } from "../components/shared/SuccessOverlay";
import { ShareOverlay } from "../components/shared/ShareOverlay";
import { cn } from "../components/ui/utils";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useAuth } from "../../lib/contexts/AuthContext";
import { EmptyState } from "../components/shared/EmptyState";
import { FileUploader } from "../components/features/documents/FileUploader";
import { DocumentList } from "../components/features/documents/DocumentList";
import { Label } from "../components/ui/label";
import { secureDecrypt } from "../../lib/encryption";
import { getPrivacyKey } from "../../lib/privacyKeyStore";
import { generateLoanReport } from "../../lib/pdfGenerator";

export function LoanDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loanId } = useParams();
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [loan, setLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userId = user?.id;
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<"agreement" | "receipt" | "identity" | "other">("agreement");
  const [refreshDocs, setRefreshDocs] = useState(0);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  useEffect(() => {
    fetchLoanDetail();
  }, [loanId]);

  async function fetchLoanDetail() {
    setIsLoading(true);
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from('loans')
        .select('*, repayments(*), reminders(*)')
        .eq('id', loanId)
        .single();

      if (error) throw error;

      // Decrypt description if needed
      const privacyKey = getPrivacyKey();
      if (data.description) {
        data.description = await secureDecrypt(data.description, privacyKey);
      }

      setLoan(data);
    } catch (error: any) {
      console.error("Error fetching loan detail:", error);
      toast.error("Failed to load record details");
    } finally {
      setIsLoading(false);
    }
  }

  // ====================
  // OFFER ACCEPTANCE
  // ====================

  const handleAcceptOffer = async () => {
    try {
      if (!user) {
        toast.error("Please sign in to accept this offer");
        return;
      }

      const { error } = await supabase
        .from('loans')
        .update({ status: 'active' })
        .eq('id', loanId);

      if (error) throw error;

      toast.success("Loan offer accepted!");
      setLoan({ ...loan, status: 'active' });

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'ACCEPT_LOAN_OFFER',
        resource_type: 'loan',
        resource_id: loanId,
        metadata: { amount: loan.amount }
      });

    } catch (error) {
      console.error("Error accepting offer:", error);
      toast.error("Failed to accept offer");
    }
  };

  const handleDeclineOffer = async () => {
    if (!window.confirm("Are you sure you want to decline this loan offer?")) return;

    try {
      if (!user) return;

      const { error } = await supabase
        .from('loans')
        .update({ status: 'rejected' }) // Or delete if preferred
        .eq('id', loanId);

      if (error) throw error;

      toast.success("Loan offer declined");
      navigate('/dashboard');

    } catch (error) {
      console.error("Error declining offer:", error);
      toast.error("Failed to decline offer");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] animate-pulse">Loading record...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl mb-2 font-bold">Loan not found</h2>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isLender = loan.lender_id === userId;
  const isBorrower = loan.user_id !== userId; // Assuming loan.user_id is the creator (Lender) for personal loans? Wait, need to check data model.
  // Actually, standard model: user_id is creator.
  // If type='personal' and I created it, I am the lender.
  // If status is 'pending_acceptance', the creator is the Lender. 
  // The viewer (if not creator) is the potential Borrower.

  const isPendingAcceptance = loan.status === 'pending_acceptance';

  // Logic for names
  const otherPartyName = isLender ? loan.borrower_name : "Lender";

  const paidAmount = loan.repayments?.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0) || 0;
  const remainingAmount = Math.max(0, loan.amount - paidAmount);
  const progress = (paidAmount / loan.amount) * 100;

  const handleSendReminder = async (message: string) => {
    setIsSendingReminder(true);
    try {
      const { error } = await supabase
        .from('reminders')
        .insert([{
          loan_id: loanId,
          message: message,
          channel: 'whatsapp',
          status: 'delivered'
        }]);

      if (error) throw error;

      toast.success("Reminder successfully logged");
      setIsSuccessOpen(true);
      fetchLoanDetail(); // Refresh data
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      toast.error(error.message || "Failed to log reminder");
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleUploadComplete = async (path: string, file: File) => {
    try {
      const { error } = await supabase
        .from('documents')
        .insert([{
          loan_id: loanId,
          uploader_id: userId,
          file_path: path,
          file_type: file.type,
          file_size: file.size,
          category: uploadCategory
        }]);

      if (error) throw error;

      toast.success("Document attached successfully");
      setShowUpload(false);
      setRefreshDocs(prev => prev + 1);
    } catch (error: any) {
      console.error("Error saving document record:", error);
      toast.error("Failed to save document record");
    }
  };

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await generateLoanReport(loan, loan.repayments || []);
      toast.success("PDF report downloaded successfully");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32">
      {/* Premium Animated Header */}
      <header className="relative overflow-hidden pt-8 pb-32 px-4 shadow-2xl shadow-indigo-900/10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 z-0"
          animate={{
            background: [
              "linear-gradient(to bottom right, #4f46e5, #2563eb, #7e22ce)",
              "linear-gradient(to bottom right, #7e22ce, #4f46e5, #2563eb)",
              "linear-gradient(to bottom right, #2563eb, #7e22ce, #4f46e5)",
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating Orbs - Consistent with SignIn */}
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -left-20 w-72 h-72 bg-purple-400/20 rounded-full blur-[80px]"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-xl mx-auto relative z-10 text-white">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-md shrink-0 transition-all hover:scale-105"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-white/20 p-1 rounded-md backdrop-blur-sm">
                    <CreditCard className="w-3 h-3 text-white" />
                  </div>
                  <h1 className="text-lg font-bold tracking-tight text-white/90">Loan Details</h1>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">
                    ID: #{loan.id.slice(0, 8)}
                  </span>
                </div>
              </motion.div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-md shrink-0 transition-all hover:scale-105"
                title="Export PDF Report"
              >
                {isExportingPDF ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </Button>
              <StatusTag status={loan.status} className="bg-white/10 border-white/20 text-white backdrop-blur-md shadow-lg" />
            </div>
          </div>

          <div className="text-center py-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[11px] uppercase font-black tracking-[0.2em] text-blue-100/80 mb-2 drop-shadow-sm"
            >
              Remaining Balance
            </motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-7xl font-black tracking-tighter tabular-nums mb-3 drop-shadow-2xl bg-gradient-to-b from-white to-blue-50 bg-clip-text text-transparent"
            >
              {formatAmount(remainingAmount)}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2"
            >
              <div className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-sm font-bold text-blue-50">
                of {formatAmount(loan.amount)} total
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-5 -mt-8 relative z-20">
        <div className="space-y-6">
          {/* Acceptance Banner */}
          {isPendingAcceptance && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-xl border border-amber-200/50 rounded-3xl p-6 shadow-lg shadow-amber-900/5 overflow-hidden relative group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {isLender ? <UserPlus className="w-16 h-16" /> : <CheckCircle2 className="w-16 h-16" />}
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Action Required</span>
                </div>

                {isLender ? (
                  <>
                    <h3 className="text-lg font-black text-amber-900 mb-1">Pending Acceptance</h3>
                    <p className="text-sm font-medium text-amber-800/70 leading-relaxed mb-4">
                      {otherPartyName} hasn't accepted this loan offer yet. Share the link with them to finalize the agreement.
                    </p>
                    <Button
                      onClick={() => {
                        setShareUrl(`${window.location.origin}/loan/${loanId}`);
                        setIsShareOpen(true);
                      }}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold h-11 px-6 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                    >
                      Share Offer Link
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-black text-amber-900 mb-1">Loan Offer Received</h3>
                    <p className="text-sm font-medium text-amber-800/70 leading-relaxed mb-4">
                      {otherPartyName} has sent you a loan offer of {formatAmount(loan.amount)}. Please review the terms below and accept to proceed.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleAcceptOffer}
                        className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold h-11 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                      >
                        Accept Offer
                      </Button>
                      <Button
                        onClick={handleDeclineOffer}
                        variant="outline"
                        className="flex-1 rounded-xl border-amber-200 text-amber-800 hover:bg-amber-50 font-bold h-11"
                      >
                        Decline
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Main Info Card - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/50 relative overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2 flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center font-black text-2xl text-slate-400 shadow-inner">
                  {otherPartyName.charAt(0)}
                </div>
                <div>
                  <div className="text-[11px] uppercase font-black tracking-widest text-indigo-500 mb-0.5">
                    {isLender ? "Borrower" : "Lender"}
                  </div>
                  <div className="text-xl font-black text-slate-900 tracking-tight">{otherPartyName}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase font-black tracking-widest text-slate-400 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Due Date
                </div>
                <div className="font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg inline-block border border-slate-100">
                  {loan.due_date ? formatDate(loan.due_date) : "No date"}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase font-black tracking-widest text-slate-400 mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Repaid
                </div>
                <div className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg inline-block border border-emerald-100/50">
                  {formatAmount(paidAmount)}
                </div>
              </div>

              <div className="col-span-2 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth Progress</span>
                  <span className="text-xs font-black text-indigo-600">{Math.round(progress)}%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 rounded-full shadow-sm"
                  />
                </div>
              </div>
            </div>

            {loan.description && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[11px] uppercase font-black tracking-widest text-slate-400 mb-3">
                  <History className="w-3.5 h-3.5" />
                  Contract Notes
                </div>
                <p className="text-sm leading-relaxed text-slate-600 font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {loan.description}
                </p>
              </div>
            )}

            {(loan.bank_details) && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[11px] uppercase font-black tracking-widest text-slate-400 mb-3">
                  <DollarSign className="w-3.5 h-3.5" />
                  Payout Destination
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{loan.bank_details.bankName}</div>
                    <div className="text-xs text-slate-900 font-bold mb-0.5">{loan.bank_details.accountName}</div>
                    <div className="text-xs text-slate-500 font-mono tracking-tight">{loan.bank_details.accountNumber}</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Repayment History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-tight text-slate-900">Payment History</h3>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {loan.repayments && loan.repayments.length > 0 ? (
              <div className="space-y-4">
                {loan.repayments.map((repayment: any, i: number) => (
                  <motion.div
                    key={repayment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-slate-50 transition-all group hover:shadow-sm"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{formatDateTime(repayment.date)}</div>
                      {repayment.note && <div className="text-xs text-slate-400 font-medium mt-0.5">{repayment.note}</div>}
                    </div>
                    <div className="text-lg font-black text-emerald-600 tabular-nums bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100/50">
                      +{formatAmount(repayment.amount)}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={History}
                title="Fresh Ledger"
                description="No payments have been recorded for this agreement yet."
                actionLabel="Record First Payment"
                onAction={() => navigate(`/loan/${loan.id}/add-payment`)}
                className="py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200"
              />
            )}
          </motion.div>

          {/* Communication History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-tight text-slate-900">Communication Log</h3>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>

            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-100 before:via-slate-200 before:to-transparent">
              {loan.reminders && loan.reminders.length > 0 ? (
                loan.reminders.map((reminder: any, idx: number) => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="relative flex items-start gap-4"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 shadow-sm transition-transform hover:scale-110",
                      idx === 0 ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-white border border-slate-100 text-slate-400"
                    )}>
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Notice Sent</div>
                        <div className="text-[10px] font-bold text-slate-400">{formatDateTime(reminder.created_at)}</div>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all">
                        <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{reminder.message}"</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 ml-1">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Delivered via {reminder.channel || 'social'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="Quiet Channel"
                  description="No formal reminders or notices have been sent for this record."
                  className="py-8 bg-slate-50/50 rounded-3xl"
                />
              )}
            </div>
          </motion.div>

          {/* Documents Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-tight text-slate-900">Documents</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpload(!showUpload)}
                  className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-xs"
                >
                  {showUpload ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  {showUpload ? "Cancel" : "Add New"}
                </Button>
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showUpload && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <div className="mb-4">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Document Type</Label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {(['agreement', 'receipt', 'identity', 'other'] as const).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setUploadCategory(cat)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 capitalize",
                              uploadCategory === cat
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-105"
                                : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <FileUploader
                      bucketName="loan-documents"
                      folder={loanId || ""}
                      onUploadComplete={handleUploadComplete}
                      acceptedFileTypes={{
                        'application/pdf': ['.pdf'],
                        'image/jpeg': ['.jpg', '.jpeg'],
                        'image/png': ['.png']
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DocumentList
              loanId={loanId || ""}
              currentUserId={userId || ""}
              refreshTrigger={refreshDocs}
            />
          </motion.div>
        </div>
      </main>

      {/* Action Bar - Enhanced Floating */}
      {loan.status !== "completed" && (
        <div className="fixed bottom-8 left-0 right-0 px-6 z-50">
          <div className="max-w-xl mx-auto flex gap-3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex-1"
            >
              <Button
                className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-lg shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] active:scale-[0.98] transition-all hover:scale-[1.02] border-t border-white/20"
                onClick={() => navigate(`/loan/${loan.id}/add-payment`)}
              >
                <Plus className="w-6 h-6 mr-2" />
                Record Payment
              </Button>
            </motion.div>
            {isLender && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  onClick={() => handleSendReminder("This is a formal reminder about our agreement.")}
                  disabled={isSendingReminder}
                  className="w-16 h-16 rounded-[2rem] bg-white border border-slate-200 text-slate-900 shadow-xl shadow-black/5 flex items-center justify-center p-0 hover:bg-slate-50 transition-colors"
                >
                  {isSendingReminder ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Bell className="w-6 h-6" />}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      )}
      <SuccessOverlay
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Reminder Sent!"
        message={`We've successfully delivered a formal reminder notice to ${otherPartyName} via WhatsApp.`}
        type="info"
        details={[
          { label: "Recipient", value: otherPartyName },
          { label: "Channel", value: "WhatsApp Business" },
          { label: "Status", value: "Delivered" }
        ]}
        actionLabel="Got it"
      />

      <ShareOverlay
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Resend Invitation"
        shareUrl={shareUrl}
        recipientName={otherPartyName}
      />
    </div>
  );
}

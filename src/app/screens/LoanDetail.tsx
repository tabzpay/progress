import { ArrowLeft, Calendar, Clock, Bell, Plus, ChevronRight, User, TrendingUp, DollarSign, History, MessageSquare, Send, CheckCircle2, UserPlus, Briefcase, FileText, X, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from 'react'; // Added useState import
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { StatusTag } from "../components/StatusTag";
import { ProgressBar } from "../components/ProgressBar";
import { ReminderBadge } from "../components/ReminderBadge";
import { SuccessOverlay } from "../components/SuccessOverlay"; // Added SuccessOverlay import
import { ShareOverlay } from "../components/ShareOverlay";
import { NotificationHub } from "../components/NotificationHub";
import { cn } from "../components/ui/utils";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { FileUploader } from "../components/FileUploader";
import { DocumentList } from "../components/DocumentList";
import { InstallmentList } from "../components/InstallmentList";
import { Label } from "../components/ui/label";
import { secureDecrypt } from "../../lib/encryption";
import { getPrivacyKey } from "../../lib/privacyKeyStore";
import { generateLoanReport } from "../../lib/pdfGenerator";

export function LoanDetail() {
  const navigate = useNavigate();
  const { loanId } = useParams();
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [loan, setLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
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
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Loading record...</p>
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
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Premium Header */}
      <header className="relative overflow-hidden pt-8 pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-[60px]"
          />
        </div>

        <div className="max-w-xl mx-auto relative z-10 text-white">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight">Loan Details</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">
                  #{loan.id.slice(0, 8)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0"
                title="Export PDF Report"
              >
                {isExportingPDF ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </Button>
              <StatusTag status={loan.status} className="bg-white/20 border-white/20 text-white" />
            </div>
          </div>

          <div className="text-center">
            <div className="text-[11px] uppercase font-black tracking-[0.2em] text-white/60 mb-2">Remaining Balance</div>
            <div className="text-6xl font-black tracking-tighter tabular-nums mb-2">
              {formatAmount(remainingAmount)}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-white/70">
              <span>of {formatAmount(loan.amount)} total</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-6 -mt-8 relative z-20">
        <div className="space-y-8">
          {/* Acceptance Banner */}
          {!loan.isAccepted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm overflow-hidden relative group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <UserPlus className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Action Required</span>
                </div>
                <h3 className="text-lg font-black text-amber-900 mb-1">Pending Acceptance</h3>
                <p className="text-sm font-medium text-amber-800/70 leading-relaxed mb-4">
                  {otherPartyName} hasn't accepted this loan agreement yet. Resend the invitation to finalize the records.
                </p>
                <Button
                  onClick={() => {
                    setShareUrl(`https://progress-app.com/accept/${Math.random().toString(36).substring(7)}`);
                    setIsShareOpen(true);
                  }}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 px-6 shadow-md shadow-amber-600/20"
                >
                  Resend Invite
                </Button>
              </div>
            </motion.div>
          )}

          {/* Main Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5 relative overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2 flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-2xl text-slate-400">
                  {otherPartyName.charAt(0)}
                </div>
                <div>
                  <div className="text-[11px] uppercase font-black tracking-widest text-slate-400 mb-0.5">
                    {isLender ? "Borrower" : "Lender"}
                  </div>
                  <div className="text-xl font-black text-slate-900">{otherPartyName}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase font-black tracking-widest text-slate-400 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Due Date
                </div>
                <div className="font-bold text-slate-900">{loan.due_date ? formatDate(loan.due_date) : "No date"}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase font-black tracking-widest text-slate-400 mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Repaid
                </div>
                <div className="font-bold text-emerald-600">{formatAmount(paidAmount)}</div>
              </div>

              <div className="col-span-2 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth Progress</span>
                  <span className="text-xs font-black text-slate-900">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
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
                <p className="text-sm leading-relaxed text-slate-600 font-medium">{loan.description}</p>
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
                  <div key={repayment.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{formatDateTime(repayment.date)}</div>
                      {repayment.note && <div className="text-xs text-slate-400 font-medium mt-0.5">{repayment.note}</div>}
                    </div>
                    <div className="text-lg font-black text-emerald-600 tabular-nums">
                      +{formatAmount(repayment.amount)}
                    </div>
                  </div>
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
                  <div key={reminder.id} className="relative flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 shadow-sm",
                      idx === 0 ? "bg-emerald-500 text-white" : "bg-white border border-slate-100 text-slate-400"
                    )}>
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Notice Sent</div>
                        <div className="text-[10px] font-bold text-slate-400">{formatDateTime(reminder.created_at)}</div>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                        <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{reminder.message}"</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 ml-1">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Delivered via {reminder.channel || 'social'}</span>
                      </div>
                    </div>
                  </div>
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
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
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
                      folder={loanId}
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

      {/* Action Bar - Glassmorphism Floating */}
      {loan.status !== "completed" && (
        <div className="fixed bottom-8 left-0 right-0 px-6 z-50">
          <div className="max-w-xl mx-auto flex gap-3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex-1"
            >
              <Button
                className="w-full h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
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
                  className="w-16 h-16 rounded-[2rem] bg-white border border-slate-200 text-slate-900 shadow-xl shadow-black/5 flex items-center justify-center p-0"
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

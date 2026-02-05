import { useState } from "react";
import { ArrowLeft, BellRing, MessageSquare, Send, CheckCircle2, Info, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { mockLoans, currentUser, Loan } from "../data/mockData";
import { cn } from "../components/ui/utils";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export function SendNotice() {
    const navigate = useNavigate();
    const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
    const [isSent, setIsSent] = useState(false);
    const [actionableLoans, setActionableLoans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchActionableLoans();
    }, []);

    async function fetchActionableLoans() {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);

            if (!user) return;

            const { data, error } = await supabase
                .from('loans')
                .select('*')
                .eq('lender_id', user.id)
                .neq('status', 'PAID');

            if (error) throw error;
            setActionableLoans(data || []);
        } catch (error: any) {
            console.error("Error fetching loans:", error);
            toast.error("Failed to load records");
        } finally {
            setIsLoading(false);
        }
    }

    const templates = [
        { title: "Friendly Nudge", message: "Hey! Just a friendly reminder about our agreement. Hope all is well!" },
        { title: "Upcoming Due Date", message: "Hi! Just wanted to let you know the due date for our record is approaching soon." },
        { title: "Follow-up", message: "Hello! Checking in on the status of our active loan. Let me know if you have any updates." },
    ];

    const handleSend = async (message: string) => {
        if (!selectedLoanId) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('reminders')
                .insert([{
                    loan_id: selectedLoanId,
                    message: message,
                    channel: 'whatsapp',
                    status: 'delivered'
                }]);

            if (error) throw error;

            setIsSent(true);
            toast.success("Notice delivered and logged");

            setTimeout(() => {
                setIsSent(false);
                setSelectedLoanId(null);
            }, 3000);
        } catch (error: any) {
            console.error("Error sending notice:", error);
            toast.error(error.message || "Failed to deliver notice");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedLoan = actionableLoans.find(l => l.id === selectedLoanId);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32">
            {/* Premium Header */}
            <header className="relative overflow-hidden pt-8 pb-12 px-4 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-[60px]"
                    />
                </div>

                <div className="max-w-xl mx-auto relative z-10 text-white">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0"
                            onClick={() => navigate("/dashboard")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Send Notice</h1>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-1">
                                Remind your borrowers
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-xl mx-auto px-4 -mt-6 relative z-20">
                <div className="space-y-6">
                    {/* Actionable Loans List */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 ml-4">Select a Record</h3>
                        <div className="space-y-3">
                            {actionableLoans.map((loan) => (
                                <motion.button
                                    key={loan.id}
                                    onClick={() => setSelectedLoanId(loan.id)}
                                    className={cn(
                                        "w-full bg-white border rounded-[2rem] p-5 text-left transition-all shadow-sm flex items-center gap-4 group hover:border-emerald-200",
                                        selectedLoanId === loan.id ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-slate-200/60"
                                    )}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                        selectedLoanId === loan.id ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[15px] font-bold text-slate-900 truncate">{loan.borrower_name}</div>
                                        <div className="text-xs font-medium text-slate-400 mt-0.5">${Number(loan.amount).toLocaleString()} • Due {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'No date'}</div>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        selectedLoanId === loan.id ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-200 group-hover:border-emerald-300"
                                    )}>
                                        {selectedLoanId === loan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {selectedLoanId && !isSent && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-6"
                            >
                                <div className="space-y-3">
                                    <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 ml-4">Choose Template</h3>
                                    <div className="grid gap-3">
                                        {templates.map((tpl, i) => (
                                            <button
                                                key={i}
                                                className="bg-white border border-slate-200/60 rounded-2xl p-4 text-left hover:border-emerald-300 transition-colors group disabled:opacity-50"
                                                onClick={() => handleSend(tpl.message)}
                                                disabled={isLoading}
                                            >
                                                <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight mb-1">{tpl.title}</div>
                                                <div className="text-xs text-slate-500 leading-relaxed italic">"{tpl.message}"</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                        <Info className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                                        Sending a notice is a friendly way to keep communications clear. We'll send this via WhatsApp/SMS automatically.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {isSent && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm"
                            >
                                <div className="bg-white rounded-[3rem] p-10 text-center max-w-sm w-full shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 inset-x-0 h-2 bg-emerald-500" />
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">Notice Sent!</h2>
                                    <p className="text-slate-500 text-sm font-medium mb-8">
                                        We've successfully delivered your reminder to {selectedLoan?.borrower_name}.
                                    </p>
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold"
                                        onClick={() => navigate("/dashboard")}
                                    >
                                        Back to Dashboard
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {!selectedLoanId && (
                <div className="fixed bottom-12 left-0 right-0 px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200/50">
                        Select a borrower to proceed
                    </div>
                </div>
            )}
        </div>
    );
}

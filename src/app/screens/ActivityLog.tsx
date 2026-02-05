import { ArrowLeft, MessageSquare, DollarSign, Plus, Clock, Search, Filter, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../components/ui/utils";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export function ActivityLog() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchActivities();
    }, []);

    async function fetchActivities() {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Fetch loans where user is either lender or borrower, including related data
            const { data, error } = await supabase
                .from('loans')
                .select('*, repayments(*), reminders(*)')
                .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`);

            if (error) throw error;

            const flattened = (data || []).flatMap((loan: any) => [
                ...(loan.reminders || []).map((r: any) => ({
                    id: r.id,
                    type: "notice" as const,
                    loanId: loan.id,
                    title: "Notice Sent",
                    message: r.message,
                    date: r.created_at,
                    borrower: loan.borrower_name,
                    amount: loan.amount, // Or some other logic if needed
                })),
                ...(loan.repayments || []).map((rp: any) => ({
                    id: rp.id,
                    type: "payment" as const,
                    loanId: loan.id,
                    title: "Payment Received",
                    message: rp.note || "Logged a payment check",
                    date: rp.created_at,
                    borrower: loan.borrower_name,
                    amount: rp.amount,
                }))
            ]).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setActivities(flattened);
        } catch (error: any) {
            console.error("Error fetching activities:", error);
            toast.error("Failed to load history");
        } finally {
            setIsLoading(false);
        }
    }

    const filteredActivities = activities.filter(act =>
        act.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32">
            {/* Premium Header */}
            <header className="relative overflow-hidden pt-8 pb-12 px-4 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-[60px]"
                    />
                </div>

                <div className="max-w-xl mx-auto relative z-10 text-white">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0"
                            onClick={() => navigate("/more")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Activity Log</h1>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Full app history</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-xl mx-auto px-4 -mt-6 relative z-20">
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-indigo-900/5 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Filter by person or message..."
                            className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-indigo-500/10 focus:border-indigo-500/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((act) => (
                            <motion.button
                                key={`${act.type}-${act.id}`}
                                onClick={() => navigate(`/loan/${act.loanId}`)}
                                className="w-full bg-white border border-slate-100 rounded-[2rem] p-5 text-left flex items-start gap-4 hover:border-indigo-200 transition-all shadow-sm group"
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors",
                                    act.type === "notice" ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white"
                                )}>
                                    {act.type === "notice" ? <MessageSquare className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{act.title}</span>
                                        <span className="text-[10px] font-bold text-slate-300">{formatDateTime(act.date)}</span>
                                    </div>
                                    <div className="text-[15px] font-bold text-slate-900 mb-1 truncate">{act.borrower}</div>
                                    <p className="text-xs text-slate-500 italic line-clamp-1">{act.message}</p>
                                </div>
                                <div className="pt-4">
                                    <span className={cn(
                                        "text-[13px] font-black tabular-nums",
                                        act.type === "payment" ? "text-emerald-500" : "text-slate-400"
                                    )}>
                                        {act.type === "payment" ? "+" : ""}${act.amount.toLocaleString()}
                                    </span>
                                </div>
                            </motion.button>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                <Clock className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">No activity found</h3>
                            <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

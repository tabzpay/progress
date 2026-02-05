import { Plus, DollarSign, FileText, Menu, User, Search, Filter, ArrowRight, BellRing, UserPlus, HeartPulse, AlertTriangle, CheckCircle2, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoanCard } from "../components/LoanCard";
import { BalanceBadge } from "../components/BalanceBadge";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { mockLoans, currentUser, Loan, mockNotifications } from "../data/mockData";
import { NotificationHub } from "../components/NotificationHub";
import { cn } from "../components/ui/utils";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "lent" | "borrowed">("all");
  const [currency, setCurrency] = useState("USD");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const mapLoanStatus = (status: string): "active" | "partial" | "completed" | "overdue" => {
    switch (status.toUpperCase()) {
      case "PENDING":
      case "ACTIVE":
        return "active";
      case "PAID":
        return "completed";
      default:
        return "active";
    }
  };

  const hasUnread = notifications.some(n => !n.is_read);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchLoans();
        fetchNotifications(user.id);
        subscribeToNotifications(user.id);
      } else {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  async function fetchNotifications(uid: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  function subscribeToNotifications(uid: string) {
    const channel = supabase
      .channel('notifications-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${uid}`
        },
        (payload: any) => {
          setNotifications(prev => [payload.new, ...prev]);
          toast.info(`New alert: ${payload.new.title}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success("All cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  async function fetchLoans() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*, repayments(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error: any) {
      console.error("Error fetching loans:", error);
      toast.error("Failed to load your records");
    } finally {
      setIsLoading(false);
    }
  }

  const currencies = [
    { code: "USD", symbol: "$", label: "US Dollar" },
    { code: "EUR", symbol: "€", label: "Euro" },
    { code: "GBP", symbol: "£", label: "British Pound" },
    { code: "NGN", symbol: "₦", label: "Nigerian Naira" },
    { code: "GHS", symbol: "₵", label: "Ghanaian Cedi" },
    { code: "KES", symbol: "KSh", label: "Kenyan Shilling" },
  ];

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Calculate Health Check items
  const urgentLoans = useMemo(() => {
    return loans.filter(loan => {
      const dueDate = loan.due_date ? new Date(loan.due_date) : null;
      if (!dueDate) return false;

      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const isOverdue = diffDays < 0 && loan.status !== "PAID";
      const isDueSoon = diffDays >= 0 && diffDays <= 3 && loan.status !== "PAID";

      const isLender = loan.lender_id === userId;
      const matchesFilter = activeFilter === "all" || (activeFilter === "lent" && isLender) || (activeFilter === "borrowed" && !isLender);

      return (isOverdue || isDueSoon) && matchesFilter;
    });
  }, [loans, activeFilter, userId]);

  // Calculate totals
  const owedToYou = loans
    .filter((loan) => loan.lender_id === userId && loan.status !== "PAID" && loan.currency === currency)
    .reduce((sum, loan) => {
      const repaid = loan.repayments?.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0) || 0;
      return sum + (Number(loan.amount) - repaid);
    }, 0);

  const youOwe = loans
    .filter((loan) => loan.borrower_id === userId && loan.status !== "PAID" && loan.currency === currency)
    .reduce((sum, loan) => {
      const repaid = loan.repayments?.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0) || 0;
      return sum + (Number(loan.amount) - repaid);
    }, 0);

  const netBalance = owedToYou - youOwe;

  const activeLoansCount = loans.filter(
    (loan) => loan.status !== "PAID"
  ).length;

  // Filter and Search Logic
  const filteredLoans = loans
    .filter((loan) => {
      const matchesSearch =
        loan.borrower_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const isLender = loan.lender_id === userId;
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "lent" && isLender) ||
        (activeFilter === "borrowed" && !isLender);

      return matchesSearch && matchesFilter;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const hasLoans = filteredLoans.length > 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Premium Header */}
      <header className="relative overflow-hidden pt-8 pb-12 px-4 shadow-xl">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700">
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-400/20 rounded-full blur-[80px]"
          />
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/30">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Progress</h1>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 self-center">
              {currencies.slice(0, 3).map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-black transition-all",
                    currency === c.code
                      ? "bg-white text-indigo-600 shadow-lg scale-105"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  {c.code}
                </button>
              ))}
              <select
                value={currencies.some(c => c.code === currency && currencies.indexOf(c) > 2) ? currency : ""}
                onChange={(e) => e.target.value && setCurrency(e.target.value)}
                className="bg-transparent text-white/60 text-[10px] font-bold px-2 outline-none appearance-none cursor-pointer hover:text-white"
              >
                <option value="" disabled className="text-slate-900">More</option>
                {currencies.slice(3).map(c => (
                  <option key={c.code} value={c.code} className="text-slate-900">{c.code}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <BellRing className="w-5 h-5" />
                {hasUnread && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm"
                onClick={() => navigate("/profile")}
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Net Balance Focus */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={currency} // Re-animate when currency changes
            className="text-center mb-10"
          >
            <p className="text-white/70 text-sm font-medium mb-1 uppercase tracking-widest text-[10px]">Net Position</p>
            <h2 className="text-5xl font-bold text-white tracking-tighter tabular-nums">
              {netBalance >= 0 ? "+" : "-"}{formatAmount(Math.abs(netBalance))}
            </h2>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[10px] text-white/90">
              <div className={`w-1.5 h-1.5 rounded-full ${netBalance >= 0 ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
              {activeLoansCount} Active Records
            </div>
          </motion.div>

          {/* Glassmorphism Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-lg shadow-black/5"
            >
              <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mb-3">Owed to you</p>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-white tabular-nums">{formatAmount(owedToYou)}</span>
                <div className="w-6 h-6 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                  <Plus className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-lg shadow-black/5"
            >
              <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mb-3">You owe</p>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-white tabular-nums">{formatAmount(youOwe)}</span>
                <div className="w-6 h-6 rounded-lg bg-rose-400/20 flex items-center justify-center">
                  <div className="w-2.5 h-0.5 bg-rose-400 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Search and Filters Bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border py-4 px-4 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search people or notes..."
              className="pl-10 h-11 bg-muted/50 border-transparent transition-all focus:bg-background focus:border-primary/20 focus:ring-primary/20 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0 mr-1" />
            {(["all", "lent", "borrowed"] as const).map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "secondary"}
                size="sm"
                className={cn(
                  "rounded-full px-5 text-xs font-medium capitalize h-8 transition-all shrink-0",
                  activeFilter === filter ? "shadow-md shadow-primary/20" : "bg-muted/70 hover:bg-muted"
                )}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Quick Actions Scroll */}
        <div className="mb-10">
          <h2 className="text-[10px] items-center gap-1.5 flex uppercase font-bold tracking-widest text-muted-foreground mb-4">
            Quick Actions
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/create-loan")}
              className="flex flex-col items-center gap-3 shrink-0"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-indigo-600">Lend Money</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/groups")}
              className="flex flex-col items-center gap-3 shrink-0"
            >
              <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shadow-sm">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-violet-600">Join Group</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/send-notice")}
              className="flex flex-col items-center gap-3 shrink-0"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                <BellRing className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">Send Notice</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/more")}
              className="flex flex-col items-center gap-3 shrink-0"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm group-hover:bg-slate-100 transition-colors">
                <Menu className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600">More</span>
            </motion.button>
          </div>
        </div>

        {/* Health Check Banner */}
        <AnimatePresence>
          {urgentLoans.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 flex flex-col gap-4 relative shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white">
                      <HeartPulse className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-rose-600">Health Check</span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-100/50 px-2 py-1 rounded-full">
                    {urgentLoans.length} Urgent Items
                  </span>
                </div>
                <p className="text-sm font-medium text-rose-900/70 leading-relaxed pr-8">
                  You have {urgentLoans.length} records that require immediate attention. Tap to resolve or send a nudge.
                </p>
                <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
                  {urgentLoans.slice(0, 3).map(loan => {
                    const dueDate = loan.due_date ? new Date(loan.due_date) : null;
                    const today = new Date();
                    const isOverdue = dueDate && Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) < 0;

                    return (
                      <button
                        key={loan.id}
                        onClick={() => navigate(`/loan/${loan.id}`)}
                        className="bg-white/80 hover:bg-white border border-rose-200/50 rounded-xl px-4 py-2.5 text-left transition-all group shrink-0"
                      >
                        <div className="text-[10px] font-black text-rose-600 uppercase mb-0.5">{isOverdue ? 'Overdue' : 'Due Soon'}</div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          {loan.borrower_name} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-[10px] items-center gap-1.5 flex uppercase font-bold tracking-widest text-muted-foreground">
            Active Records
            <span className="bg-muted px-1.5 py-0.5 rounded text-[9px] text-muted-foreground">{filteredLoans.length}</span>
          </h2>
          {(isLoading || searchQuery || activeFilter !== "all") && (
            <button
              onClick={() => { setSearchQuery(""); setActiveFilter("all"); }}
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              {isLoading ? "Refreshing..." : "Clear All Filters"}
            </button>
          )}
        </div>

        {hasLoans ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredLoans.map((loan: any, index) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <LoanCard
                    id={loan.id}
                    borrowerName={loan.borrower_name}
                    amount={loan.amount}
                    remainingAmount={loan.amount - (loan.repayments?.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0) || 0)}
                    dueDate={loan.due_date}
                    status={mapLoanStatus(loan.status)}
                    type={loan.type || "personal"}
                    currency={loan.currency}
                    isLender={loan.lender_id === userId}
                    onClick={() => navigate(`/loan/${loan.id}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12 px-4"
          >
            <div className="bg-white border border-dashed border-slate-200 rounded-[3rem] p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No records found</h3>
              <p className="text-sm text-slate-400 font-medium max-w-[240px] leading-relaxed">
                We couldn't find any loans matching your current search or filters.
              </p>
              <Button
                variant="outline"
                className="mt-8 rounded-xl border-slate-200 font-bold"
                onClick={() => { setSearchQuery(""); setActiveFilter("all"); }}
              >
                Reset all filters
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => navigate("/create-loan")}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <NotificationHub
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}

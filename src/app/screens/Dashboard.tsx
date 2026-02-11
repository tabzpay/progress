import { Plus, DollarSign, FileText, Menu, User, Search, Filter, ArrowRight, BellRing, UserPlus, HeartPulse, AlertTriangle, CheckCircle2, Navigation, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoanCard } from "../components/LoanCard";
import { BalanceBadge } from "../components/BalanceBadge";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { mockLoans, currentUser, Loan, mockNotifications } from "../data/mockData";
import { NotificationHub } from "../components/NotificationHub";
import { cn } from "../components/ui/utils";
import { useEffect } from "react";
import { analytics } from "../../lib/analytics";
import { secureDecrypt, isEncrypted } from "../../lib/encryption";
import { getPrivacyKey } from "../../lib/privacyKeyStore";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { DashboardSkeleton } from "../components/Skeletons";
import { exportToCSV } from "../../lib/csvExport";
import { requestNotificationPermission, notifyIfPossible } from "../../lib/notifications";
import { LendingTrendChart, StatusDistributionChart, BorrowerConcentrationChart, CashFlowForecastChart } from "../components/AnalyticsCharts";
import { ChevronDown, ChevronUp, BarChart } from "lucide-react";

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
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Advanced Filters State
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

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

  // Analytics Data Calculations
  const analyticsData = useMemo(() => {
    // 1. Lending Trend (Last 6 months)
    const trend: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      trend[monthName] = 0;
    }

    loans.forEach(loan => {
      const date = new Date(loan.created_at);
      const monthName = date.toLocaleString('default', { month: 'short' });
      if (trend.hasOwnProperty(monthName)) {
        trend[monthName] += Number(loan.amount);
      }
    });

    const trendData = Object.entries(trend).map(([name, amount]) => ({ name, amount }));

    // 2. Status Distribution
    const statusCounts = {
      Paid: loans.filter(l => l.status === "PAID").length,
      Active: loans.filter(l => l.status === "ACTIVE" || l.status === "PENDING").length,
      Overdue: loans.filter(l => {
        const dueDate = l.due_date ? new Date(l.due_date) : null;
        return dueDate && dueDate < now && l.status !== "PAID";
      }).length
    };
    const distributionData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // 3. Borrower Concentration
    const borrowerTotals: { [key: string]: number } = {};
    loans.forEach(loan => {
      if (loan.lender_id === userId) {
        borrowerTotals[loan.borrower_name] = (borrowerTotals[loan.borrower_name] || 0) + Number(loan.amount);
      }
    });
    const concentrationData = Object.entries(borrowerTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 4. Cash Flow Forecast (Next 4 Weeks)
    const forecast: { name: string; inflow: number; outflow: number }[] = [];
    for (let i = 0; i < 4; i++) {
      forecast.push({
        name: i === 0 ? "This Week" : `Week ${i + 1}`,
        inflow: 0,
        outflow: 0
      });
    }

    loans.forEach(loan => {
      if (loan.status === "PAID") return;
      const dueDate = loan.due_date ? new Date(loan.due_date) : null;
      if (!dueDate) return;

      const weeksDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7));
      if (weeksDiff >= 0 && weeksDiff < 4) {
        const repaid = loan.repayments?.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0) || 0;
        const remaining = Number(loan.amount) - repaid;

        if (loan.lender_id === userId) {
          forecast[weeksDiff].inflow += remaining;
        } else if (loan.borrower_id === userId) {
          forecast[weeksDiff].outflow += remaining;
        }
      }
    });

    return { trendData, distributionData, concentrationData, forecastData: forecast };
  }, [loans, userId]);

  const hasUnread = notifications.some(n => !n.is_read);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchLoans();
        fetchNotifications(user.id);
        const unsubscribeNotifications = subscribeToNotifications(user.id);
        const unsubscribeData = subscribeToDataChanges(user.id);

        // Request browser notification permission
        requestNotificationPermission();

        return () => {
          unsubscribeNotifications();
          unsubscribeData();
        };
      } else {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  function subscribeToDataChanges(uid: string) {
    const channel = supabase
      .channel('dashboard-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loans'
        },
        () => {
          console.log("Real-time update: loans table changed. Refreshing...");
          fetchLoans();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'repayments'
        },
        () => {
          console.log("Real-time update: repayments table changed. Refreshing...");
          fetchLoans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

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
          notifyIfPossible(payload.new.title, { body: payload.new.message });
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

      // Decrypt descriptions if needed
      const privacyKey = getPrivacyKey();
      const loansWithDecryption = await Promise.all((data || []).map(async (loan) => ({
        ...loan,
        description: await secureDecrypt(loan.description || "", privacyKey)
      })));

      setLoans(loansWithDecryption);
    } catch (error: any) {
      console.error("Error fetching loans:", error);
      toast.error("Failed to load your records");
    } finally {
      setIsLoading(false);
    }
  }

  const handleExportCSV = () => {
    const headers = [
      { label: "Borrower", key: "borrower_name" },
      { label: "Amount", key: "amount" },
      { label: "Currency", key: "currency" },
      { label: "Status", key: "status" },
      { label: "Due Date", key: "due_date" },
      { label: "Type", key: "type" },
      { label: "Created At", key: "created_at" }
    ];

    exportToCSV(filteredLoans, headers, `progress-loans-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success("CSV export started");
  };

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
  const filteredLoans = useMemo(() => {
    return loans
      .filter((loan) => {
        // 1. Search Query
        const matchesSearch =
          loan.borrower_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (loan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

        // 2. Base Lender/Borrower Filter
        const isLender = loan.lender_id === userId;
        const matchesFilter =
          activeFilter === "all" ||
          (activeFilter === "lent" && isLender) ||
          (activeFilter === "borrowed" && !isLender);

        // 3. Status Filter
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(loan.status);

        // 4. Type Filter
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(loan.type || "personal");

        // 5. Amount Filter
        const amount = Number(loan.amount);
        const matchesMinAmount = !minAmount || amount >= Number(minAmount);
        const matchesMaxAmount = !maxAmount || amount <= Number(maxAmount);

        // 6. Date Filter
        const loanDate = new Date(loan.due_date);
        const matchesStartDate = !startDate || loanDate >= new Date(startDate);
        const matchesEndDate = !endDate || loanDate <= new Date(endDate);

        return matchesSearch && matchesFilter && matchesStatus && matchesType &&
          matchesMinAmount && matchesMaxAmount && matchesStartDate && matchesEndDate;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [loans, searchQuery, activeFilter, userId, selectedStatuses, selectedTypes, minAmount, maxAmount, startDate, endDate]);

  const hasLoans = filteredLoans.length > 0;

  const resetFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
    setMinAmount("");
    setMaxAmount("");
    setStartDate("");
    setEndDate("");
    setSelectedStatuses([]);
    setSelectedTypes([]);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Premium Header */}
      <header className="relative overflow-hidden pt-8 md:pt-10 pb-12 md:pb-16 px-4 md:px-6 shadow-2xl">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-blue-700 to-violet-800">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.4, 0.3]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-white/10 rounded-full blur-[80px] md:blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -left-32 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-400/10 rounded-full blur-[70px] md:blur-[100px]"
          />
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 md:mb-12">
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2.5"
              >
                <div className="bg-white/15 p-2 rounded-xl backdrop-blur-xl border border-white/20 shadow-inner">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-white tracking-tight">Progress</h1>
              </motion.div>

              <div className="flex items-center gap-2.5 sm:hidden">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-white hover:bg-white/15 rounded-xl h-10 w-10 border border-white/20 backdrop-blur-xl shadow-inner"
                    onClick={() => setIsNotificationsOpen(true)}
                  >
                    <BellRing className="w-4 h-4" />
                    {hasUnread && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-indigo-600 animate-pulse ring-2 ring-rose-500/20" />
                    )}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/15 rounded-xl h-10 w-10 border border-white/20 backdrop-blur-xl shadow-inner"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {/* Refined Currency Selector */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-1 sm:flex-initial items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-0.5 gap-0.5"
              >
                {currencies.slice(0, 3).map((c) => (
                  <motion.button
                    key={c.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setCurrency(c.code)}
                    className={cn(
                      "flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-[10px] font-black transition-all",
                      currency === c.code
                        ? "bg-white text-indigo-700 shadow-xl"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    {c.code}
                  </motion.button>
                ))}
                <div className="w-px h-3 bg-white/20 mx-1 hidden sm:block" />
                <div className="relative group px-2 sm:pr-2 hidden sm:block">
                  <select
                    value={currencies.some(c => c.code === currency && currencies.indexOf(c) > 2) ? currency : ""}
                    onChange={(e) => e.target.value && setCurrency(e.target.value)}
                    className="bg-transparent text-white/60 text-[10px] font-black outline-none appearance-none cursor-pointer hover:text-white pr-3"
                  >
                    <option value="" disabled className="text-slate-900">More</option>
                    {currencies.slice(3).map(c => (
                      <option key={c.code} value={c.code} className="text-slate-900">{c.code}</option>
                    ))}
                  </select>
                  <Navigation className="w-2.5 h-2.5 text-white/40 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-white transition-colors" />
                </div>
              </motion.div>

              <div className="hidden sm:flex items-center gap-2.5">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-white hover:bg-white/15 rounded-2xl h-11 w-11 border border-white/20 backdrop-blur-xl shadow-inner"
                    onClick={() => setIsNotificationsOpen(true)}
                  >
                    <BellRing className="w-5 h-5" />
                    {hasUnread && (
                      <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-indigo-600 animate-pulse ring-2 ring-rose-500/20" />
                    )}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/15 rounded-2xl h-11 w-11 border border-white/20 backdrop-blur-xl shadow-inner"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Elevated Net Balance Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={currency}
            className="text-center mb-10 md:mb-14"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              className="text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-4"
            >
              Net Position
            </motion.p>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
              <span className="opacity-40">{netBalance >= 0 ? "+" : "-"}</span>
              {formatAmount(Math.abs(netBalance)).replace(/[^\d]/g, '')}
              <span className="text-2xl md:text-4xl align-top ml-1 opacity-60 leading-none">{currency}</span>
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 md:mt-6 inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-[10px] md:text-[11px] font-black text-white/95 shadow-2xl"
            >
              <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${netBalance >= 0 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]'} animate-pulse`} />
              {activeLoansCount} ACTIVE RECORDS
            </motion.div>
          </motion.div>

          {/* Enhanced Glassmorphism Stats Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-5">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -2, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl md:rounded-[2rem] p-4 md:p-5 shadow-2xl transition-colors cursor-default"
            >
              <p className="text-white/50 text-[9px] md:text-[10px] uppercase font-black tracking-widest mb-2 md:mb-4">Owed to you</p>
              <div className="flex items-end justify-between">
                <span className="text-lg md:text-2xl font-black text-white tabular-nums">{formatAmount(owedToYou)}</span>
                <div className="w-6 md:w-8 h-6 md:h-8 rounded-lg md:rounded-xl bg-emerald-400/20 flex items-center justify-center border border-emerald-400/20 shadow-inner">
                  <Plus className="w-3 md:w-4 h-3 md:h-4 text-emerald-400" />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -2, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl md:rounded-[2rem] p-4 md:p-5 shadow-2xl transition-colors cursor-default"
            >
              <p className="text-white/50 text-[9px] md:text-[10px] uppercase font-black tracking-widest mb-2 md:mb-4">You owe</p>
              <div className="flex items-end justify-between">
                <span className="text-lg md:text-2xl font-black text-white tabular-nums">{formatAmount(youOwe)}</span>
                <div className="w-6 md:w-8 h-6 md:h-8 rounded-lg md:rounded-xl bg-rose-400/20 flex items-center justify-center border border-rose-400/20 shadow-inner">
                  <div className="w-2.5 md:w-3 h-0.5 bg-rose-400 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Analytics Toggle & Dashboard */}
          <div className="mt-8">
            <Button
              variant="ghost"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="w-full flex items-center justify-between px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl md:rounded-[2rem] group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:bg-indigo-500/30 transition-colors">
                  <BarChart className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white/80">Visual Analytics</span>
              </div>
              {showAnalytics ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </Button>

            <AnimatePresence>
              {showAnalytics && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lending Trend */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Lending Trend</h3>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Last 6 Months</span>
                      </div>
                      <LendingTrendChart data={analyticsData.trendData} currency={currency} />
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Distribution</h3>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[8px] font-bold text-white/40 uppercase">Paid</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span className="text-[8px] font-bold text-white/40 uppercase">Active</span>
                          </div>
                        </div>
                      </div>
                      <StatusDistributionChart data={analyticsData.distributionData} />
                    </div>

                    {/* Cash Flow Forecast */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl md:col-span-2">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">Cash Flow Forecast</h3>
                          <p className="text-[8px] text-white/30 uppercase mt-1">Expected inflows vs outflows</p>
                        </div>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Next 4 Weeks</span>
                      </div>
                      <CashFlowForecastChart data={analyticsData.forecastData} currency={currency} />
                    </div>

                    {/* Borrower Concentration */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl md:col-span-2">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-400">Concentration</h3>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Top 5 Borrowers</span>
                      </div>
                      <BorrowerConcentrationChart data={analyticsData.concentrationData} currency={currency} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Search and Filters Bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border py-4 px-4 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex gap-2">
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search people or notes..."
                className="pl-10 h-11 bg-muted/50 border-transparent transition-all focus:bg-background focus:border-primary/20 focus:ring-primary/20 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? "default" : "secondary"}
              size="icon"
              className="h-11 w-11 rounded-xl shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 space-y-6">
                  {/* Amount Range */}
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Amount Range ({currency})</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="h-10 bg-background rounded-xl text-xs"
                      />
                      <div className="w-2 h-px bg-border shrink-0" />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="h-10 bg-background rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Due Date Range</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-10 bg-background rounded-xl text-xs"
                      />
                      <div className="w-2 h-px bg-border shrink-0" />
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-10 bg-background rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Status Multi-select */}
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {["PENDING", "ACTIVE", "PAID", "OVERDUE"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setSelectedStatuses(prev =>
                              prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
                            );
                          }}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                            selectedStatuses.includes(status)
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-border text-muted-foreground hover:border-slate-300"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Loan Type</Label>
                    <div className="flex flex-wrap gap-2">
                      {["personal", "business", "emergency", "education", "other"].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setSelectedTypes(prev =>
                              prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                            );
                          }}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border capitalize",
                            selectedTypes.includes(type)
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-border text-muted-foreground hover:border-slate-300"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] items-center gap-1.5 flex uppercase font-bold tracking-widest text-muted-foreground">
              Active Records
              <span className="bg-muted px-1.5 py-0.5 rounded text-[9px] text-muted-foreground">{filteredLoans.length}</span>
            </h2>
            {filteredLoans.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="text-[10px] items-center gap-1 flex uppercase font-bold tracking-widest text-primary hover:opacity-70 transition-opacity"
              >
                <Download className="w-3 h-3" />
                Export CSV
              </button>
            )}
          </div>
          {(isLoading || searchQuery || activeFilter !== "all" || selectedStatuses.length > 0 || selectedTypes.length > 0 || minAmount || maxAmount || startDate || endDate) && (
            <button
              onClick={resetFilters}
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
          <EmptyState
            icon={Search}
            title="No records found"
            description={searchQuery || activeFilter !== "all"
              ? "We couldn't find any loans matching your current search or filters."
              : "You haven't created any records yet. Start by creating your first loan record."}
            actionLabel={searchQuery || activeFilter !== "all" ? "Reset all filters" : "Create your first loan"}
            onAction={() => {
              if (searchQuery || activeFilter !== "all") {
                setSearchQuery("");
                setActiveFilter("all");
              } else {
                navigate("/create-loan");
              }
            }}
            className="py-12"
          />
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

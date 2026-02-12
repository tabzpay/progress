import { Plus, DollarSign, FileText, Menu, User, Search, Filter, ArrowRight, BellRing, UserPlus, HeartPulse, AlertTriangle, CheckCircle2, Navigation, Download, Tag, Sparkles } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SEO } from "../components/SEO";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoanCard } from "../components/LoanCard";
import { PersonalScoreCard } from "../components/PersonalScoreCard";
import { RepaymentTimeline } from "../components/RepaymentTimeline";
import { BalanceBadge } from "../components/BalanceBadge";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { mockLoans, currentUser, Loan, mockNotifications } from "../data/mockData";
import { NotificationHub } from "../components/NotificationHub";
import { cn } from "../components/ui/utils";
import { WelcomeTooltip } from "../components/WelcomeTooltip";
import { analytics } from "../../lib/analytics";
import { secureDecrypt, isEncrypted } from "../../lib/encryption";
import { getPrivacyKey } from "../../lib/privacyKeyStore";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { DashboardSkeleton } from "../components/Skeletons";
import { exportToCSV } from "../../lib/csvExport";
import { requestNotificationPermission, notifyIfPossible } from "../../lib/notifications";
import { LendingTrendChart, StatusDistributionChart, BorrowerConcentrationChart, CashFlowForecastChart } from "../components/AnalyticsCharts";
import { ChevronDown, ChevronUp, BarChart, PieChart } from "lucide-react";
import { calculateCreditScore, type CreditScoreResult } from "../../lib/CreditScore";
import { useAuth } from "../../lib/contexts/AuthContext";

export function Dashboard() {
  const { user, signOut: logOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "true";
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(showWelcome);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "lent" | "borrowed">("all");
  const [currency, setCurrency] = useState("USD");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = user?.id;
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [creditScores, setCreditScores] = useState<Record<string, CreditScoreResult>>({});
  const [userCreditScore, setUserCreditScore] = useState<CreditScoreResult | null>(null);
  const [isScoreDetailOpen, setIsScoreDetailOpen] = useState(false);
  const [upcomingInstallments, setUpcomingInstallments] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Advanced Filters State
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

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

    // 5. Debt Progress (Total Borrowed vs Total Repaid)
    let totalBorrowed = 0;
    let totalRepaidByBorrower = 0;
    loans.forEach(loan => {
      if (loan.borrower_id === userId) {
        totalBorrowed += Number(loan.amount);
        totalRepaidByBorrower += loan.repayments?.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0) || 0;
      }
    });
    const debtProgress = totalBorrowed > 0 ? (totalRepaidByBorrower / totalBorrowed) * 100 : 0;

    return { trendData, distributionData, concentrationData, forecastData: forecast, debtProgress, totalBorrowed, totalRepaidByBorrower };
  }, [loans, userId]);

  const hasUnread = notifications.some(n => !n.is_read);

  useEffect(() => {
    if (!user) return;

    async function init() {
      fetchLoans();
      fetchNotifications(user!.id);
      fetchContacts(user!.id);
      const unsubscribeNotifications = subscribeToNotifications(user!.id);
      const unsubscribeData = subscribeToDataChanges(user!.id);

      // Fetch user's own credit score
      try {
        const score = await calculateCreditScore(user!.id);
        setUserCreditScore(score);
      } catch (err) {
        console.error("Error fetching user credit score:", err);
      }

      // Request browser notification permission
      requestNotificationPermission();

      return () => {
        unsubscribeNotifications();
        unsubscribeData();
      };
    }
    init();
  }, [user]);

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
          fetchLoans();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        () => {
          console.log("Real-time update: contacts table changed. Refreshing...");
          fetchContacts(uid);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function fetchContacts(uid: string) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', uid)
        .order('last_loan_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }

  async function updateContactTags(contactId: string, tags: string[]) {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ tags })
        .eq('id', contactId);

      if (error) throw error;
      toast.success("Tags updated");
      setIsTagModalOpen(false);
    } catch (error) {
      console.error("Error updating tags:", error);
      toast.error("Failed to update tags");
    }
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
        .select('*, repayments(*), installments(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Decrypt descriptions if needed
      const privacyKey = getPrivacyKey();
      const loansWithDecryption = await Promise.all((data || []).map(async (loan) => ({
        ...loan,
        description: await secureDecrypt(loan.description || "", privacyKey)
      })));

      setLoans(loansWithDecryption);

      // Auto-set filter based on net position
      const totalOwedToYou = loansWithDecryption
        .filter(l => l.lender_id === userId && l.status !== "PAID")
        .reduce((sum, l) => sum + Number(l.amount), 0);
      const totalYouOwe = loansWithDecryption
        .filter(l => l.borrower_id === userId && l.status !== "PAID")
        .reduce((sum, l) => sum + Number(l.amount), 0);

      if (totalYouOwe > totalOwedToYou && activeFilter === 'all') {
        setActiveFilter('borrowed');
      }

      // Process upcoming installments for the borrower
      const borrowerInstallments = loansWithDecryption
        .filter(loan => loan.borrower_id === userId)
        .flatMap(loan => (loan.installments || []).map((inst: any) => ({
          ...inst,
          borrower_name: loan.borrower_name,
          loan_id: loan.id,
          currency: loan.currency
        })))
        .filter(inst => inst.status === 'pending' || inst.status === 'partially_paid')
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

      setUpcomingInstallments(borrowerInstallments);

      // Fetch credit scores for all borrowers
      const borrowerIds = Array.from(new Set(
        loansWithDecryption
          .map(l => l.borrower_id)
          .filter(id => !!id && id !== "null" && id !== "undefined" && typeof id === 'string')
      )) as string[];
      fetchCreditScores(borrowerIds);
    } catch (error: any) {
      console.error("Error fetching loans:", error);
      toast.error("Failed to load your records");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCreditScores(borrowerIds: string[]) {
    const scores: Record<string, CreditScoreResult> = {};
    await Promise.allSettled(borrowerIds.map(async (id) => {
      try {
        const result = await calculateCreditScore(id);
        scores[id] = result;
      } catch (err) {
        console.error(`Error calculating score for ${id}:`, err);
      }
    }));
    setCreditScores(prev => ({ ...prev, ...scores }));
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

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [contacts, searchQuery]);

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
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <SEO title="Dashboard" description="Overview of your active loans, reminders, and financial health." />
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
                  <PieChart className="w-4 h-4 text-white" />
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

          {/* Elevated Net Balance Focus or Personal Score Card */}
          <AnimatePresence mode="wait">
            {activeFilter === 'borrowed' && userCreditScore ? (
              <PersonalScoreCard
                key="personal-score"
                creditScore={userCreditScore}
                onDetail={() => setIsScoreDetailOpen(true)}
                className="mb-10 md:mb-14"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key={currency + activeFilter}
                className="text-center mb-10 md:mb-14"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 space-y-1"
                >
                  <h3 className="text-white/60 text-lg md:text-xl font-medium tracking-tight">
                    {getTimeGreeting()}, <span className="text-white font-bold">{displayName}</span>
                  </h3>
                  {!showWelcome && activeLoansCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-white/80 uppercase tracking-widest"
                    >
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      {activeLoansCount} Active {activeLoansCount === 1 ? 'Record' : 'Records'}
                    </motion.div>
                  )}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  className="text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-4"
                >
                  {activeFilter === 'lent' ? 'Lending Position' : activeFilter === 'borrowed' ? 'Borrowing Position' : 'Net Position'}
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
            )}
          </AnimatePresence>

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
                <div>
                  <span className="text-lg md:text-2xl font-black text-white tabular-nums">{formatAmount(youOwe)}</span>
                  {activeFilter === 'borrowed' && analyticsData.totalBorrowed > 0 && (
                    <div className="mt-4 space-y-1.5 w-full min-w-[120px]">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-white/40">
                        <span>Repaid: {Math.round(analyticsData.debtProgress)}%</span>
                        <span>{formatAmount(analyticsData.totalRepaidByBorrower)}</span>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${analyticsData.debtProgress}%` }}
                          className="h-full bg-rose-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
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
              onClick={() => navigate("/analytics")}
              className="flex flex-col items-center gap-3 shrink-0"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <BarChart className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-blue-600">Analytics</span>
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

        {/* Repayment Timeline for Borrowers */}
        {upcomingInstallments.length > 0 && (activeFilter === 'all' || activeFilter === 'borrowed') && (
          <div className="mb-10">
            <RepaymentTimeline
              installments={upcomingInstallments}
              onPay={(inst) => navigate(`/loan/${inst.loan_id}`)}
            />
          </div>
        )}

        {/* Contacts Section for Lenders */}
        {(activeFilter === 'all' || activeFilter === 'lent') && contacts.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[10px] items-center gap-1.5 flex uppercase font-black tracking-widest text-slate-400">
                <UserPlus className="w-3.5 h-3.5" />
                Your Network
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
              {filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  whileHover={{ y: -4 }}
                  className="shrink-0 w-36 bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors relative">
                    {contact.name.charAt(0)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContact(contact);
                        setIsTagModalOpen(true);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-slate-100 rounded-lg flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                  <div className="font-bold text-slate-900 text-sm truncate mb-1">{contact.name}</div>
                  <div className="flex flex-wrap gap-1 mb-4 h-4 overflow-hidden">
                    {contact.tags?.slice(0, 1).map((tag: string) => (
                      <span key={tag} className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-0.5">
                        <Tag className="w-2 h-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/create-loan?borrower=${encodeURIComponent(contact.name)}`)}
                    className="w-full h-8 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Lend
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

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
                    creditScore={creditScores[loan.borrower_id]?.score}
                    creditTier={creditScores[loan.borrower_id]?.tier}
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

      {/* Credit Score Analysis Modal */}
      <AnimatePresence>
        {isScoreDetailOpen && userCreditScore && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScoreDetailOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Credit Analysis</h3>
                    <p className="text-sm font-medium text-slate-500">Factors impacting your score</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsScoreDetailOpen(false)}
                    className="rounded-full"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "On-time Payment Rate", value: userCreditScore.factors.onTimePaymentRate, weight: "40%", description: "Consistency in meeting due dates" },
                    { label: "Loan Completion Rate", value: userCreditScore.factors.loanCompletionRate, weight: "30%", description: "Percentage of loans fully settled" },
                    { label: "Volume Score", value: userCreditScore.factors.totalVolumeNormalized, weight: "20%", description: "Total financial throughput handled" },
                    { label: "History Duration", value: userCreditScore.factors.relationshipDuration, weight: "10%", description: "Time since your first recorded loan" }
                  ].map((factor, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={factor.label}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-800">{factor.label}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">Weight: {factor.weight}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">{factor.description}</p>
                        </div>
                        <span className="text-lg font-black text-indigo-600">{factor.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${factor.value}%` }}
                          transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                          className="h-full bg-indigo-500"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-10 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex gap-3">
                    <HeartPulse className="w-5 h-5 text-indigo-600 shrink-0" />
                    <p className="text-xs font-semibold text-indigo-900/70 leading-relaxed">
                      Your score is calculated using a weighted average of your transaction history. Increasing your on-time payment rate has the highest impact on reaching the next tier.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tag Management Modal */}
      <AnimatePresence>
        {isTagModalOpen && selectedContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTagModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Manage Tags</h3>
                    <p className="text-sm font-medium text-slate-500">For {selectedContact.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsTagModalOpen(false)}
                    className="rounded-full"
                  >
                    <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Current Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.tags?.length > 0 ? (
                        selectedContact.tags.map((tag: string) => (
                          <span key={tag} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                            {tag}
                            <button
                              onClick={() => {
                                const newTags = selectedContact.tags.filter((t: string) => t !== tag);
                                updateContactTags(selectedContact.id, newTags);
                                setSelectedContact({ ...selectedContact, tags: newTags });
                              }}
                              className="hover:text-rose-500 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <p className="text-xs font-medium text-slate-400 italic py-2 ml-1">No tags added yet</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Add New Tag</Label>
                    <div className="flex gap-2">
                      <Input
                        id="new-tag"
                        placeholder="e.g. Family"
                        className="rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-100 font-bold text-sm h-11"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              const newTags = [...(selectedContact.tags || []), val];
                              updateContactTags(selectedContact.id, newTags);
                              setSelectedContact({ ...selectedContact, tags: newTags });
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50">
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[11px] border-slate-200 text-slate-400 hover:bg-slate-50"
                    onClick={() => setIsTagModalOpen(false)}
                  >
                    Close Management
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WelcomeTooltip
        isVisible={isWelcomeVisible}
        onDismiss={() => {
          setIsWelcomeVisible(false);
          // Clear the search param so it doesn't show again on refresh
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("welcome");
          setSearchParams(newParams, { replace: true });
        }}
      />
    </div>
  );
}

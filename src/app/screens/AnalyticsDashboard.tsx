import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, DollarSign, AlertCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/layout/SEO';

import {
    getLendingTrends,
    getCashFlowData,
    getDefaultRates,
    getStatusDistribution,
    getBorrowerConcentration,
    type TrendData,
    type CashFlowData,
    type DefaultRateData,
    type StatusDistribution,
    type BorrowerConcentration
} from '../../lib/AnalyticsEngine';
import {
    LendingTrendChart,
    StatusDistributionChart,
    BorrowerConcentrationChart,
    CashFlowForecastChart
} from '../components/features/analytics/AnalyticsCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../../lib/contexts/AuthContext';

export function AnalyticsDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const userId = user?.id;
    const currency = '$';
    const [isLoading, setIsLoading] = useState(true);

    // Analytics data
    const [lendingTrends, setLendingTrends] = useState<TrendData[]>([]);
    const [cashFlow, setCashFlow] = useState<CashFlowData[]>([]);
    const [defaultRates, setDefaultRates] = useState<DefaultRateData | null>(null);
    const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
    const [borrowerConcentration, setBorrowerConcentration] = useState<BorrowerConcentration[]>([]);

    // Get current user removed because it's handled by useAuth
    useEffect(() => {
        // userId dependency in next hook will handle fetching data when user is available
    }, [user]);

    // Fetch analytics data
    useEffect(() => {
        if (!userId) return;

        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const [trends, flow, rates, distribution, concentration] = await Promise.all([
                    getLendingTrends(userId, 6),
                    getCashFlowData(userId, 6),
                    getDefaultRates(userId),
                    getStatusDistribution(userId),
                    getBorrowerConcentration(userId, 5)
                ]);

                setLendingTrends(trends);
                setCashFlow(flow);
                setDefaultRates(rates);
                setStatusDistribution(distribution);
                setBorrowerConcentration(concentration);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [userId]);

    // Calculate summary metrics
    const totalLent = lendingTrends.reduce((sum, item) => sum + item.amount, 0);
    const avgMonthlyLending = lendingTrends.length > 0 ? totalLent / lendingTrends.length : 0;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            <SEO title="Analytics" description="Visualize your lending trends, cash flow, and credit health data." />

            {/* Premium Header */}
            <header className="relative overflow-hidden pt-8 pb-12 px-4 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-[60px]"
                    />
                </div>
                <div className="max-w-2xl mx-auto relative z-10 text-white">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0 flex items-center justify-center transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Analytics</h1>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-1">Lending insights</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-20">
                <Tabs defaultValue="overview" className="w-full">
                    <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-slate-100/60 mb-6">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-50 rounded-xl">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="trends">Trends</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <MetricCard
                                icon={DollarSign}
                                label="Total Lent (6 mo)"
                                value={`${currency}${totalLent.toLocaleString()}`}
                                iconColor="text-emerald-600"
                                iconBg="bg-emerald-50"
                            />
                            <MetricCard
                                icon={TrendingUp}
                                label="Avg Monthly"
                                value={`${currency}${Math.round(avgMonthlyLending).toLocaleString()}`}
                                iconColor="text-blue-600"
                                iconBg="bg-blue-50"
                            />
                            <MetricCard
                                icon={Users}
                                label="Total Loans"
                                value={defaultRates?.totalLoans.toString() || '0'}
                                iconColor="text-purple-600"
                                iconBg="bg-purple-50"
                            />
                            <MetricCard
                                icon={AlertCircle}
                                label="Default Rate"
                                value={`${defaultRates?.defaultRate.toFixed(1) || '0'}%`}
                                iconColor="text-red-600"
                                iconBg="bg-red-50"
                            />
                        </div>

                        {/* Charts */}
                        <div className="space-y-6">
                            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Loan Status</h3>
                                {isLoading ? (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                                    </div>
                                ) : statusDistribution.length > 0 ? (
                                    <StatusDistributionChart data={statusDistribution} />
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
                                )}
                            </div>

                            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Top Borrowers</h3>
                                {isLoading ? (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                                    </div>
                                ) : borrowerConcentration.length > 0 ? (
                                    <BorrowerConcentrationChart data={borrowerConcentration} currency={currency} />
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Trends Tab */}
                    <TabsContent value="trends" className="space-y-6">
                        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Monthly Volume</h3>
                            {isLoading ? (
                                <div className="h-[250px] flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                                </div>
                            ) : lendingTrends.length > 0 ? (
                                <LendingTrendChart data={lendingTrends} currency={currency} />
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
                            )}
                        </div>

                        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Cash Flow</h3>
                            <p className="text-xs text-slate-400 mb-4">Lent (outflow) vs. repayments received (inflow)</p>
                            {isLoading ? (
                                <div className="h-[250px] flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                                </div>
                            ) : cashFlow.length > 0 ? (
                                <CashFlowForecastChart data={cashFlow} currency={currency} />
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// Metric Card Component
interface MetricCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    iconColor: string;
    iconBg: string;
}

function MetricCard({ icon: Icon, label, value, iconColor, iconBg }: MetricCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${iconBg} shrink-0`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">{label}</p>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

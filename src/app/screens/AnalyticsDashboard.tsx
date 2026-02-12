import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, DollarSign, AlertCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from "../components/SEO";
import { supabase } from '../../lib/supabase';
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
} from '../components/AnalyticsCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { useAuth } from '../../lib/contexts/AuthContext';

export function AnalyticsDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const userId = user?.id;
    const [currency, setCurrency] = useState('$');
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
            <SEO title="Analytics" description="Visualize your lending trends, cash flow, and credit health data." />
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
                            <p className="text-sm text-slate-500 mt-1">Insights into your lending activity</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="trends">Trends</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                icon={DollarSign}
                                label="Total Lent (6 months)"
                                value={`${currency}${totalLent.toLocaleString()}`}
                                iconColor="text-emerald-600"
                                iconBg="bg-emerald-50"
                            />
                            <MetricCard
                                icon={TrendingUp}
                                label="Avg. Monthly Lending"
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

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Status Distribution */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Loan Status Distribution
                                </h3>
                                {isLoading ? (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                                    </div>
                                ) : statusDistribution.length > 0 ? (
                                    <StatusDistributionChart data={statusDistribution} />
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-slate-400">
                                        No data available
                                    </div>
                                )}
                            </Card>

                            {/* Borrower Concentration */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Top Borrowers
                                </h3>
                                {isLoading ? (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                                    </div>
                                ) : borrowerConcentration.length > 0 ? (
                                    <BorrowerConcentrationChart data={borrowerConcentration} currency={currency} />
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-slate-400">
                                        No data available
                                    </div>
                                )}
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Trends Tab */}
                    <TabsContent value="trends" className="space-y-6">
                        {/* Lending Trends */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                Monthly Lending Volume
                            </h3>
                            {isLoading ? (
                                <div className="h-[250px] flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                                </div>
                            ) : lendingTrends.length > 0 ? (
                                <LendingTrendChart data={lendingTrends} currency={currency} />
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-slate-400">
                                    No data available
                                </div>
                            )}
                        </Card>

                        {/* Cash Flow */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                Cash Flow Analysis
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Compare money lent (outflow) vs. repayments received (inflow)
                            </p>
                            {isLoading ? (
                                <div className="h-[250px] flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                                </div>
                            ) : cashFlow.length > 0 ? (
                                <CashFlowForecastChart data={cashFlow} currency={currency} />
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-slate-400">
                                    No data available
                                </div>
                            )}
                        </Card>
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
            <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${iconBg}`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500">{label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

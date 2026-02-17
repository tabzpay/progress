// Customers Page - List all customers with management UI
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Plus, Search, Filter, TrendingUp, DollarSign, Users as UsersIcon, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../components/ui/utils";
import { getCustomerDisplayName, getCreditUtilization } from "../../lib/types/customer";
import { CreateCustomerModal } from "../components/features/customers/CreateCustomerModal";
import { useCustomers, useCustomerSummary } from "../../lib/hooks/useCustomers";

export function Customers() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<'all' | 'individual' | 'company'>('all');
    const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // React Query hooks - replaces useState + useEffect!
    const { data: customers = [], isLoading } = useCustomers({
        isActive: filterActive,
        customerType: filterType === 'all' ? undefined : filterType,
        searchQuery: searchQuery || undefined,
    });

    const { data: stats } = useCustomerSummary();

    // Stats with fallback
    const summaryStats = stats || {
        totalCustomers: 0,
        activeCustomers: 0,
        totalCreditIssued: 0,
        totalOutstanding: 0,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Customer Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your business relationships and credit accounts
                        </p>
                    </div>
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Customer
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={<UsersIcon className="w-6 h-6 text-blue-600" />}
                        label="Total Customers"
                        value={summaryStats.totalCustomers}
                        gradient="from-blue-500 to-blue-600"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6 text-green-600" />}
                        label="Active Customers"
                        value={summaryStats.activeCustomers}
                        gradient="from-green-500 to-green-600"
                    />
                    <StatCard
                        icon={<DollarSign className="w-6 h-6 text-purple-600" />}
                        label="Total Credit Issued"
                        value={`₦${(summaryStats.totalCreditIssued / 1000).toFixed(1)}K`}
                        gradient="from-purple-500 to-purple-600"
                    />
                    <StatCard
                        icon={<DollarSign className="w-6 h-6 text-orange-600" />}
                        label="Outstanding Balance"
                        value={`₦${(summaryStats.totalOutstanding / 1000).toFixed(1)}K`}
                        gradient="from-orange-500 to-orange-600"
                    />
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search customers by name, email, or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="flex gap-2">
                            <Button
                                variant={filterType === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilterType('all')}
                                size="sm"
                            >
                                All
                            </Button>
                            <Button
                                variant={filterType === 'individual' ? 'default' : 'outline'}
                                onClick={() => setFilterType('individual')}
                                size="sm"
                            >
                                <User className="w-4 h-4 mr-1" />
                                Individual
                            </Button>
                            <Button
                                variant={filterType === 'company' ? 'default' : 'outline'}
                                onClick={() => setFilterType('company')}
                                size="sm"
                            >
                                <Building2 className="w-4 h-4 mr-1" />
                                Company
                            </Button>
                        </div>

                        {/* Active Filter */}
                        <div className="flex gap-2">
                            <Button
                                variant={filterActive === undefined ? 'default' : 'outline'}
                                onClick={() => setFilterActive(undefined)}
                                size="sm"
                            >
                                All Status
                            </Button>
                            <Button
                                variant={filterActive === true ? 'default' : 'outline'}
                                onClick={() => setFilterActive(true)}
                                size="sm"
                            >
                                Active
                            </Button>
                            <Button
                                variant={filterActive === false ? 'default' : 'outline'}
                                onClick={() => setFilterActive(false)}
                                size="sm"
                            >
                                Inactive
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Customer List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading customers...</p>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                        <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No customers found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {searchQuery || filterType !== 'all' || filterActive !== undefined
                                ? "Try adjusting your filters"
                                : "Get started by adding your first customer"}
                        </p>
                        {!searchQuery && filterType === 'all' && filterActive === undefined && (
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add First Customer
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customers.map((customer, index) => (
                            <CustomerCard
                                key={customer.id}
                                customer={customer}
                                index={index}
                                onClick={() => navigate(`/customers/${customer.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Customer Modal */}
            <CreateCustomerModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}

// Stats Card Component
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    gradient: string;
}

function StatCard({ icon, label, value, gradient }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-lg bg-gradient-to-br", gradient, "bg-opacity-10")}>
                    {icon}
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </motion.div>
    );
}

// Customer Card Component
interface CustomerCardProps {
    customer: any;
    index: number;
    onClick: () => void;
}

function CustomerCard({ customer, index, onClick }: CustomerCardProps) {
    const displayName = getCustomerDisplayName(customer);
    const utilization = getCreditUtilization(customer);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold",
                        customer.customer_type === 'company'
                            ? "bg-gradient-to-br from-purple-500 to-purple-600"
                            : "bg-gradient-to-br from-blue-500 to-blue-600"
                    )}>
                        {customer.customer_type === 'company' ? (
                            <Building2 className="w-6 h-6" />
                        ) : (
                            <User className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {displayName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {customer.customer_type === 'company' ? 'Business' : 'Individual'}
                        </p>
                    </div>
                </div>
                <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    customer.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                )}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                </div>
            </div>

            {/* Credit Information */}
            <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Credit Limit</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                        ₦{(customer.credit_limit || 0).toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Outstanding</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                        ₦{(customer.outstanding_balance || 0).toLocaleString()}
                    </span>
                </div>

                {/* Credit Utilization Bar */}
                <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Credit Utilization</span>
                        <span>{utilization.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all",
                                utilization.percentage < 50 ? "bg-green-500" :
                                    utilization.percentage < 80 ? "bg-yellow-500" :
                                        "bg-red-500"
                            )}
                            style={{ width: `${Math.min(utilization.percentage, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* View Details Link */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {customer.email}
                </span>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </div>
        </motion.div>
    );
}

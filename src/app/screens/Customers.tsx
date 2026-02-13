// Customers Page - List all customers with management UI
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Plus, Search, Filter, TrendingUp, DollarSign, Users as UsersIcon, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../components/ui/utils";
import { getCustomers, getCustomerSummary } from "../../lib/customerService";
import { getCustomerDisplayName, getCreditUtilization } from "../../lib/types/customer";
import type { Customer } from "../../lib/types/customer";
import { useAuth } from "../../lib/contexts/AuthContext";
import { toast } from "sonner";
import { CreateCustomerModal } from "../components/CreateCustomerModal";

export function Customers() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<'all' | 'individual' | 'company'>('all');
    const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    // Summary stats
    const [stats, setStats] = useState({
        totalCustomers: 0,
        activeCustomers: 0,
        totalCreditIssued: 0,
        totalOutstanding: 0,
    });

    useEffect(() => {
        if (!user) return;

        const init = async () => {
            setIsLoading(true);
            try {
                const [customersData, summaryData] = await Promise.all([
                    getCustomers(user.id, {
                        isActive: filterActive,
                        customerType: filterType === 'all' ? undefined : filterType,
                        searchQuery: searchQuery || undefined,
                    }),
                    getCustomerSummary(user.id),
                ]);

                setCustomers(customersData);
                setStats(summaryData);
            } catch (error) {
                console.error("Error loading customers:", error);
                toast.error("Failed to load customers");
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [user, searchQuery, filterType, filterActive]);

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <header className="relative overflow-hidden pt-8 pb-10 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <h1 className="text-2xl font-black text-white mb-2">Customers</h1>
                    <p className="text-white/80 text-sm">Manage your business customers and credit</p>
                </div>
            </header>

            {/* Stats Cards */}
            <main className="max-w-6xl mx-auto px-4 -mt-6 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <UsersIcon className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">Total</span>
                        </div>
                        <div className="text-2xl font-black">{stats.totalCustomers}</div>
                        <div className="text-xs text-muted-foreground">{stats.activeCustomers} active</div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                            <span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">Issued</span>
                        </div>
                        <div className="text-2xl font-black">${stats.totalCreditIssued.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Total credit</div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                            <span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">Outstanding</span>
                        </div>
                        <div className="text-2xl font-black text-orange-600">${stats.totalOutstanding.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">To collect</div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 text-white">
                        <div className="text-[10px] uppercase font-black tracking-wider opacity-90 mb-2">Collection Rate</div>
                        <div className="text-2xl font-black">
                            {stats.totalCreditIssued > 0
                                ? (((stats.totalCreditIssued - stats.totalOutstanding) / stats.totalCreditIssued) * 100).toFixed(1)
                                : 0}%
                        </div>
                        <div className="text-xs opacity-80">Paid back</div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-card border border-border rounded-2xl p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 rounded-xl"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant={filterType === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('all')}
                                className="rounded-xl"
                            >
                                All
                            </Button>
                            <Button
                                variant={filterType === 'individual' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('individual')}
                                className="rounded-xl gap-1"
                            >
                                <User className="w-3 h-3" />
                                Individual
                            </Button>
                            <Button
                                variant={filterType === 'company' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('company')}
                                className="rounded-xl gap-1"
                            >
                                <Building2 className="w-3 h-3" />
                                Company
                            </Button>
                        </div>

                        <Button
                            onClick={() => toast.info("Create customer modal coming soon!")}
                            className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Plus className="w-4 h-4" />
                            Add Customer
                        </Button>
                    </div>
                </div>

                {/* Customer List */}
                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Loading customers...
                    </div>
                ) : customers.length === 0 ? (
                    <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <UsersIcon className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">No customers yet</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Start by adding your first business customer
                        </p>
                        <Button
                            onClick={() => toast.info("Create customer modal coming soon!")}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Plus className="w-4 h-4" />
                            Add First Customer
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {customers.map((customer) => {
                            const utilization = getCreditUtilization(customer);
                            const availableCredit = customer.credit_limit - customer.outstanding_balance;

                            return (
                                <motion.button
                                    key={customer.id}
                                    onClick={() => navigate(`/customers/${customer.id}`)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                            customer.customer_type === 'company' ? "bg-amber-100" : "bg-blue-100"
                                        )}>
                                            {customer.customer_type === 'company' ? (
                                                <Building2 className="w-6 h-6 text-amber-600" />
                                            ) : (
                                                <User className="w-6 h-6 text-blue-600" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate mb-0.5">
                                                {getCustomerDisplayName(customer)}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                {customer.email && <span className="truncate">{customer.email}</span>}
                                                {customer.payment_terms && <span>• {customer.payment_terms}</span>}
                                            </div>
                                        </div>

                                        {/* Credit Info */}
                                        <div className="text-right shrink-0">
                                            <div className="text-xs text-muted-foreground mb-1">Outstanding</div>
                                            <div className={cn(
                                                "text-sm font-black",
                                                customer.outstanding_balance > 0 ? "text-orange-600" : "text-green-600"
                                            )}>
                                                {customer.currency} {customer.outstanding_balance.toLocaleString()}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {customer.currency} {availableCredit.toLocaleString()} available
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                    </div>

                                    {/* Credit Bar */}
                                    {customer.credit_limit > 0 && (
                                        <div className="mt-3">
                                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    style={{ width: `${Math.min(utilization, 100)}%` }}
                                                    className={cn(
                                                        "h-full rounded-full transition-all",
                                                        utilization > 90 ? "bg-red-500" :
                                                            utilization > 80 ? "bg-orange-500" :
                                                                utilization > 60 ? "bg-yellow-500" :
                                                                    "bg-green-500"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

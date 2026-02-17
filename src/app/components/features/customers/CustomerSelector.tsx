// Customer Selector Component - For selecting customers in loan creation
import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Building2, User, TrendingUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import { searchCustomers } from "../../../../lib/customerService";
import { getCustomerDisplayName, getCreditUtilization, getAvailableCredit } from "../../../../lib/types/customer";
import type { Customer } from "../../../../lib/types/customer";
import { useAuth } from "../../../../lib/contexts/AuthContext";

interface CustomerSelectorProps {
    value: Customer | null;
    onChange: (customer: Customer | null) => void;
    onCreateNew?: () => void;
}

export function CustomerSelector({ value, onChange, onCreateNew }: CustomerSelectorProps) {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (!user || searchQuery.length < 2) {
            setCustomers([]);
            return;
        }

        const search = async () => {
            setIsSearching(true);
            try {
                const results = await searchCustomers(user.id, searchQuery);
                setCustomers(results);
            } catch (error) {
                console.error("Error searching customers:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, user]);

    const creditUtilization = value ? getCreditUtilization(value) : 0;
    const availableCredit = value ? getAvailableCredit(value) : 0;

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="text"
                        placeholder="Search customers by name, company, or email..."
                        value={value ? getCustomerDisplayName(value) : searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                            if (value) onChange(null); // Clear selection when typing
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        className="pl-11 h-14 bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all font-bold"
                    />
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                    {showDropdown && searchQuery.length >= 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 left-0 right-0 top-full mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
                        >
                            {isSearching ? (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    Searching...
                                </div>
                            ) : customers.length === 0 ? (
                                <div className="p-6 text-center">
                                    <p className="text-sm text-muted-foreground mb-3">No customers found</p>
                                    {onCreateNew && (
                                        <Button
                                            size="sm"
                                            onClick={onCreateNew}
                                            className="gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create New Customer
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {customers.map((customer) => {
                                        const utilization = getCreditUtilization(customer);
                                        const isHighUtilization = utilization > 80;

                                        return (
                                            <button
                                                key={customer.id}
                                                onClick={() => {
                                                    onChange(customer);
                                                    setShowDropdown(false);
                                                    setSearchQuery("");
                                                }}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors border-b border-border last:border-0 text-left"
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                    customer.customer_type === 'company' ? "bg-amber-100" : "bg-blue-100"
                                                )}>
                                                    {customer.customer_type === 'company' ? (
                                                        <Building2 className={cn("w-5 h-5", "text-amber-600")} />
                                                    ) : (
                                                        <User className={cn("w-5 h-5", "text-blue-600")} />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-sm truncate">
                                                        {getCustomerDisplayName(customer)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                        {customer.email && <span className="truncate">{customer.email}</span>}
                                                        {customer.payment_terms && (
                                                            <span className="shrink-0">• {customer.payment_terms}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <div className="text-xs font-bold text-muted-foreground">
                                                        Available Credit
                                                    </div>
                                                    <div className={cn(
                                                        "text-sm font-black",
                                                        isHighUtilization ? "text-orange-600" : "text-green-600"
                                                    )}>
                                                        {customer.currency} {getAvailableCredit(customer).toLocaleString()}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {onCreateNew && (
                                        <button
                                            onClick={onCreateNew}
                                            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-accent/50 transition-colors border-t-2 border-dashed bg-muted/30"
                                        >
                                            <Plus className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-bold text-primary">Create New Customer</span>
                                        </button>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Selected Customer Info */}
            {value && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                value.customer_type === 'company' ? "bg-amber-500" : "bg-blue-500"
                            )}>
                                {value.customer_type === 'company' ? (
                                    <Building2 className="w-6 h-6 text-white" />
                                ) : (
                                    <User className="w-6 h-6 text-white" />
                                )}
                            </div>
                            <div>
                                <div className="font-black text-lg">
                                    {getCustomerDisplayName(value)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {value.customer_type === 'company' ? 'Business Customer' : 'Individual Customer'}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onChange(null)}
                            className="text-xs"
                        >
                            Change
                        </Button>
                    </div>

                    {/* Credit Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/60 dark:bg-black/20 rounded-xl p-3">
                            <div className="text-[10px] uppercase font-black text-muted-foreground tracking-wider mb-1">
                                Credit Limit
                            </div>
                            <div className="text-lg font-black">
                                {value.currency} {value.credit_limit.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-white/60 dark:bg-black/20 rounded-xl p-3">
                            <div className="text-[10px] uppercase font-black text-muted-foreground tracking-wider mb-1">
                                Available
                            </div>
                            <div className={cn(
                                "text-lg font-black",
                                creditUtilization > 80 ? "text-orange-600" : "text-green-600"
                            )}>
                                {value.currency} {availableCredit.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Credit Utilization Bar */}
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
                                Credit Utilization
                            </span>
                            <span className="text-xs font-bold">
                                {creditUtilization.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(creditUtilization, 100)}%` }}
                                className={cn(
                                    "h-full rounded-full transition-colors",
                                    creditUtilization > 90 ? "bg-red-500" :
                                        creditUtilization > 80 ? "bg-orange-500" :
                                            creditUtilization > 60 ? "bg-yellow-500" :
                                                "bg-green-500"
                                )}
                            />
                        </div>
                    </div>

                    {/* Warning if high utilization */}
                    {creditUtilization > 80 && (
                        <div className="mt-3 flex items-start gap-2 bg-orange-100 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-800 rounded-xl p-3">
                            <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                            <div className="text-xs text-orange-900 dark:text-orange-200">
                                <strong>High credit utilization.</strong> This customer is using {creditUtilization.toFixed(0)}% of their credit limit.
                            </div>
                        </div>
                    )}

                    {/* Payment Terms */}
                    {value.payment_terms && (
                        <div className="mt-3 text-xs text-muted-foreground">
                            <strong>Payment Terms:</strong> {value.payment_terms}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

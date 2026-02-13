import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, TrendingUp, DollarSign, Calendar, FileText, AlertCircle, Edit } from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import type { Customer } from "../../lib/types/customer";
import { getCustomerDisplayName, getCreditUtilization, getAvailableCredit } from "../../lib/types/customer";
import { motion } from "motion/react";
import { cn } from "../components/ui/utils";

export function CustomerDetail() {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loans, setLoans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (customerId) {
            fetchCustomerDetails();
        }
    }, [customerId]);

    async function fetchCustomerDetails() {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch customer
            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .select('*')
                .eq('id', customerId)
                .single();

            if (customerError) throw customerError;
            setCustomer(customerData);

            // Fetch customer's loans
            const { data: loansData, error: loansError } = await supabase
                .from('loans')
                .select('*')
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false });

            if (loansError) throw loansError;
            setLoans(loansData || []);
        } catch (error: any) {
            console.error("Error fetching customer:", error);
            setError(error.message || "Failed to load customer");
            toast.error("Failed to load customer details");
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-medium">Loading customer...</p>
                </div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="bg-card border border-border rounded-3xl p-12 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-black mb-2">Customer Not Found</h2>
                    <p className="text-muted-foreground mb-6">{error || "This customer doesn't exist or you don't have access."}</p>
                    <Button onClick={() => navigate("/customers")}>
                        Back to Customers
                    </Button>
                </div>
            </div>
        );
    }

    const utilization = getCreditUtilization(customer);
    const availableCredit = getAvailableCredit(customer);
    const isOverLimit = customer.outstanding_balance > customer.credit_limit;

    const activeLoans = loans.filter(l => l.status === 'PENDING' || l.status === 'ACTIVE');
    const paidLoans = loans.filter(l => l.status === 'PAID');
    const overdueLoans = loans.filter(l => l.status === 'OVERDUE');

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white pt-16 pb-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                            onClick={() => navigate("/customers")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center",
                                    customer.customer_type === 'company' ? "bg-white/20" : "bg-white/20"
                                )}>
                                    {customer.customer_type === 'company' ? (
                                        <Building2 className="w-7 h-7 text-white" />
                                    ) : (
                                        <User className="w-7 h-7 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight">
                                        {getCustomerDisplayName(customer)}
                                    </h1>
                                    <p className="text-white/70 text-sm font-medium">
                                        {customer.customer_type === 'company' ? 'Business' : 'Individual'} Customer
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20 rounded-2xl h-10 px-4 border border-white/30"
                            onClick={() => toast.info("Edit customer coming soon!")}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Outstanding</div>
                            <div className={cn(
                                "text-2xl font-black",
                                isOverLimit && "text-red-300"
                            )}>
                                {customer.currency} {customer.outstanding_balance.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Credit Limit</div>
                            <div className="text-2xl font-black">
                                {customer.currency} {customer.credit_limit.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Available</div>
                            <div className="text-2xl font-black text-emerald-300">
                                {customer.currency} {availableCredit.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 -mt-16 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Information */}
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h2 className="text-lg font-black mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                {customer.email && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Email</div>
                                            <div className="text-sm font-medium truncate">{customer.email}</div>
                                        </div>
                                    </div>
                                )}
                                {customer.phone && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                            <Phone className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Phone</div>
                                            <div className="text-sm font-medium">{customer.phone}</div>
                                        </div>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-violet-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Address</div>
                                            <div className="text-sm font-medium">
                                                {customer.address.street && <div>{customer.address.street}</div>}
                                                {(customer.address.city || customer.address.state || customer.address.zip) && (
                                                    <div>{[customer.address.city, customer.address.state, customer.address.zip].filter(Boolean).join(', ')}</div>
                                                )}
                                                {customer.address.country && <div>{customer.address.country}</div>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Business Details */}
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h2 className="text-lg font-black mb-4">Business Terms</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Terms</span>
                                    <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                                        {customer.payment_terms}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Currency</span>
                                    <span className="text-sm font-black">{customer.currency}</span>
                                </div>
                                {customer.tax_id && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tax ID</span>
                                        <span className="text-sm font-medium">{customer.tax_id}</span>
                                    </div>
                                )}
                            </div>

                            {/* Credit Utilization */}
                            <div className="mt-6 pt-6 border-t border-border">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Credit Utilization</span>
                                    <span className={cn(
                                        "text-sm font-black",
                                        utilization > 90 ? "text-red-600" :
                                            utilization > 70 ? "text-amber-600" :
                                                "text-emerald-600"
                                    )}>
                                        {utilization.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            utilization > 90 ? "bg-red-500" :
                                                utilization > 70 ? "bg-amber-500" :
                                                    "bg-emerald-500"
                                        )}
                                        style={{ width: `${Math.min(utilization, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Transactions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black">Loan History</h2>
                                <div className="flex gap-2">
                                    <div className="text-xs font-bold text-muted-foreground">
                                        {loans.length} total loan{loans.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>

                            {/* Loan Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-emerald-50 rounded-2xl p-3">
                                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Active</div>
                                    <div className="text-xl font-black text-emerald-900">{activeLoans.length}</div>
                                </div>
                                <div className="bg-blue-50 rounded-2xl p-3">
                                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Paid</div>
                                    <div className="text-xl font-black text-blue-900">{paidLoans.length}</div>
                                </div>
                                <div className="bg-red-50 rounded-2xl p-3">
                                    <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Overdue</div>
                                    <div className="text-xl font-black text-red-900">{overdueLoans.length}</div>
                                </div>
                            </div>

                            {/* Loan List */}
                            {loans.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">No loans yet</p>
                                    <p className="text-sm text-muted-foreground">Loans for this customer will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {loans.map((loan) => (
                                        <motion.div
                                            key={loan.id}
                                            whileHover={{ x: 4 }}
                                            className="border border-border rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer"
                                            onClick={() => navigate(`/loans/${loan.id}`)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                                    loan.status === 'PAID' ? "bg-emerald-50" :
                                                        loan.status === 'OVERDUE' ? "bg-red-50" :
                                                            "bg-blue-50"
                                                )}>
                                                    <DollarSign className={cn(
                                                        "w-6 h-6",
                                                        loan.status === 'PAID' ? "text-emerald-600" :
                                                            loan.status === 'OVERDUE' ? "text-red-600" :
                                                                "text-blue-600"
                                                    )} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-lg font-black">
                                                            {loan.currency} {loan.amount.toLocaleString()}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                                            loan.status === 'PAID' ? "bg-emerald-100 text-emerald-700" :
                                                                loan.status === 'OVERDUE' ? "bg-red-100 text-red-700" :
                                                                    "bg-blue-100 text-blue-700"
                                                        )}>
                                                            {loan.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        {loan.due_date && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                Due {new Date(loan.due_date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {loan.payment_terms && (
                                                            <span>• {loan.payment_terms}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

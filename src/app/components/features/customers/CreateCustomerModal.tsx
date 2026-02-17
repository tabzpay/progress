import { useState } from "react";
import { X, Building2, User } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { motion, AnimatePresence } from "motion/react";
import { useCreateCustomer } from "../../../../lib/hooks/useCustomers";
import type { PaymentTerms, CustomerFormData } from "../../../../lib/types/customer";
import { PAYMENT_TERMS_OPTIONS } from "../../../../lib/types/customer";
import { cn } from "../../ui/utils";

interface CreateCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateCustomerModal({ isOpen, onClose, onSuccess }: CreateCustomerModalProps) {
    const createCustomer = useCreateCustomer();
    const [customerType, setCustomerType] = useState<'individual' | 'company'>('individual');

    // Form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [taxId, setTaxId] = useState("");
    const [creditLimit, setCreditLimit] = useState("0");
    const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('Net 30');
    const [currency, setCurrency] = useState("USD");
    const [notes, setNotes] = useState("");

    // Address
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zip, setZip] = useState("");
    const [country, setCountry] = useState("");

    const resetForm = () => {
        setCustomerType('individual');
        setFirstName("");
        setLastName("");
        setCompanyName("");
        setEmail("");
        setPhone("");
        setTaxId("");
        setCreditLimit("0");
        setPaymentTerms('Net 30');
        setCurrency("USD");
        setNotes("");
        setStreet("");
        setCity("");
        setState("");
        setZip("");
        setCountry("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Build customer data object
        const customerData: CustomerFormData = {
            customer_type: customerType,
            first_name: customerType === 'individual' ? firstName : undefined,
            last_name: customerType === 'individual' ? lastName : undefined,
            company_name: customerType === 'company' ? companyName : undefined,
            email: email || undefined,
            phone: phone || undefined,
            tax_id: taxId || undefined,
            address: street || city || state || zip || country ? {
                street,
                city,
                state,
                zip,
                country,
            } : undefined,
            credit_limit: parseFloat(creditLimit) || 0,
            payment_terms: paymentTerms,
            currency,
            notes: notes || undefined,
            is_active: true,
        };

        // Use the React Query mutation
        createCustomer.mutate(customerData, {
            onSuccess: () => {
                resetForm();
                onSuccess?.();
                onClose();
            },
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-black">Add Customer</h2>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Type Selector */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCustomerType('individual')}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
                                        customerType === 'individual'
                                            ? "bg-white text-emerald-600 shadow-lg"
                                            : "bg-white/20 text-white hover:bg-white/30"
                                    )}
                                >
                                    <User className="w-5 h-5" />
                                    Individual
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCustomerType('company')}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
                                        customerType === 'company'
                                            ? "bg-white text-emerald-600 shadow-lg"
                                            : "bg-white/20 text-white hover:bg-white/30"
                                    )}
                                >
                                    <Building2 className="w-5 h-5" />
                                    Company
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider">Basic Information</h3>

                                {customerType === 'individual' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name *</Label>
                                            <Input
                                                id="firstName"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="h-12 rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name *</Label>
                                            <Input
                                                id="lastName"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="h-12 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Company Name *</Label>
                                        <Input
                                            id="companyName"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="h-12 rounded-xl"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                {customerType === 'company' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="taxId">Tax ID / Registration Number</Label>
                                        <Input
                                            id="taxId"
                                            value={taxId}
                                            onChange={(e) => setTaxId(e.target.value)}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Business Terms */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider">Business Terms</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="creditLimit">Credit Limit</Label>
                                        <Input
                                            id="creditLimit"
                                            type="number"
                                            value={creditLimit}
                                            onChange={(e) => setCreditLimit(e.target.value)}
                                            className="h-12 rounded-xl"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <select
                                            id="currency"
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full h-12 bg-background border border-input rounded-xl px-4 font-medium"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="NGN">NGN</option>
                                            <option value="GHS">GHS</option>
                                            <option value="KES">KES</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                                    <select
                                        id="paymentTerms"
                                        value={paymentTerms}
                                        onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                                        className="w-full h-12 bg-background border border-input rounded-xl px-4 font-medium"
                                    >
                                        {PAYMENT_TERMS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider">Address (Optional)</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input
                                        id="street"
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                        className="h-12 rounded-xl"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State/Province</Label>
                                        <Input
                                            id="state"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="zip">ZIP/Postal Code</Label>
                                        <Input
                                            id="zip"
                                            value={zip}
                                            onChange={(e) => setZip(e.target.value)}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[100px] rounded-xl resize-none"
                                    placeholder="Any additional information about this customer..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 h-14 rounded-2xl font-bold"
                                    disabled={createCustomer.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-[2] h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold"
                                    disabled={createCustomer.isPending}
                                >
                                    {createCustomer.isPending ? "Creating..." : "Create Customer"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

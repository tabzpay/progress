import { useState } from "react";
import { ArrowLeft, Check, User, Briefcase, Users, DollarSign, Calendar, FileText, ChevronRight, BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { SuccessOverlay } from "../components/SuccessOverlay";
import { ShareOverlay } from "../components/ShareOverlay";
import { cn } from "../components/ui/utils";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

type LoanType = "personal" | "business" | "group";

export function CreateLoan() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [loanType, setLoanType] = useState<LoanType>("personal");
  const [borrowerName, setBorrowerName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const bankList: Record<string, string[]> = {
    USD: ["JPMorgan Chase", "Bank of America", "Wells Fargo", "Citigroup", "Capital One"],
    NGN: ["Zenith Bank", "GTBank", "First Bank", "Access Bank", "United Bank for Africa", "Kuda Bank", "OPay", "Moniepoint"],
    GHS: ["GCB Bank", "Ecobank Ghana", "Stanbic Bank", "Absa Bank Ghana", "Fidelity Bank Ghana"],
    KES: ["KCB Bank", "Equity Bank", "Co-operative Bank", "NCBA Bank", "M-Pesa"],
    GBP: ["HSBC", "Barclays", "Lloyds Bank", "NatWest", "Standard Chartered", "Revolut", "Monzo"],
    EUR: ["BNP Paribas", "Deutsche Bank", "Santander", "Société Générale", "Intesa Sanpaolo", "ING Group"],
  };

  const currentBanks = bankList[currency] || [];

  const currencies = [
    { code: "USD", symbol: "$", label: "US Dollar", country: "United States" },
    { code: "EUR", symbol: "€", label: "Euro", country: "European Union" },
    { code: "GBP", symbol: "£", label: "British Pound", country: "United Kingdom" },
    { code: "NGN", symbol: "₦", label: "Nigerian Naira", country: "Nigeria" },
    { code: "GHS", symbol: "₵", label: "Ghanaian Cedi", country: "Ghana" },
    { code: "KES", symbol: "KSh", label: "Kenyan Shilling", country: "Kenya" },
  ];

  const loanTypes: { value: LoanType; label: string; description: string; icon: any; color: string }[] = [
    {
      value: "personal",
      label: "Personal",
      description: "Lending to friends or family",
      icon: User,
      color: "bg-blue-500",
    },
    {
      value: "business",
      label: "Business",
      description: "Customer or supplier loans",
      icon: Briefcase,
      color: "bg-amber-500",
    },
    {
      value: "group",
      label: "Group",
      description: "Rotating savings groups",
      icon: Users,
      color: "bg-violet-500",
    },
  ];

  const handleNext = () => {
    if (step === 1 && (!loanType || !borrowerName)) {
      return;
    }
    if (step === 2 && (!amount || !dueDate)) {
      return;
    }
    if (step < 4) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to create a loan");
        navigate("/sign-in");
        return;
      }

      const { data, error } = await supabase.from('loans').insert([{
        lender_id: user.id,
        amount: parseFloat(amount),
        currency,
        status: 'PENDING',
        borrower_name: borrowerName,
        description: notes || "Shared Ledger Loan",
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        type: loanType,
        bank_details: {
          bankName,
          accountName,
          accountNumber
        }
      }]).select();

      if (error) throw error;

      // Create notification for creator
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          title: "Loan Record Created",
          message: `Your loan to ${borrowerName} for ${currency} ${amount} is now active.`,
          type: 'system',
          link_to: `/dashboard`
        }]);

      setIsSuccessOpen(true);
      toast.success("Loan successfully created!");
    } catch (error: any) {
      console.error("Error creating loan:", error);
      toast.error(error.message || "Failed to create loan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    const selectedCurrency = currencies.find(c => c.code === currency) || currencies[0];
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: selectedCurrency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Premium Header */}
      <header className="relative overflow-hidden pt-8 pb-10 px-4">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-[60px]"
          />
        </div>

        <div className="max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0"
              onClick={handleBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white tracking-tight">Create New Loan</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={cn(
                        "w-4 h-1 rounded-full transition-all duration-300",
                        s === step ? "w-8 bg-white" : "bg-white/30"
                      )}
                    />
                  ))}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">
                  Step {step} of 4
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Step Content */}
      <main className="max-w-xl mx-auto px-6 -mt-4 relative z-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="space-y-8"
          >
            {step === 1 && (
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold mb-1">Loan Type</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    What's the purpose of this record?
                  </p>

                  <div className="grid gap-3">
                    {loanTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = loanType === type.value;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setLoanType(type.value)}
                          className={cn(
                            "relative w-full p-4 rounded-2xl border-2 text-left transition-all group overflow-hidden",
                            isSelected
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                              : "border-border bg-card hover:border-border/80 hover:bg-accent/50"
                          )}
                        >
                          <div className="flex items-center gap-4 relative z-10">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                              isSelected ? type.color + " text-white" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                            )}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-[15px] mb-0.5">{type.label}</div>
                              <div className="text-xs text-muted-foreground font-medium">
                                {type.description}
                              </div>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5 text-white" />
                              </motion.div>
                            )}
                          </div>
                          {isSelected && (
                            <div className={cn("absolute inset-y-0 left-0 w-1", type.color.replace('bg-', 'bg-'))} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold mb-1">Borrower</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Who is this loan for?
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="borrowerName" className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/70 ml-1">Full Name or Phone</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="borrowerName"
                          type="text"
                          placeholder="e.g. Sarah Chen"
                          value={borrowerName}
                          onChange={(e) => setBorrowerName(e.target.value)}
                          className="pl-11 h-14 bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all"
                        />
                      </div>
                    </div>
                    <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <BellRing className="w-5 h-5 text-indigo-600" />
                      </div>
                      <p className="text-[11px] font-medium text-indigo-900/70 leading-relaxed">
                        We'll notify {borrowerName || "the person"} so they can verify the terms and track payments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold mb-1">Financial Terms</h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    Set the core numbers for this loan
                  </p>

                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between ml-1">
                        <Label htmlFor="amount" className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/70">Loan Amount</Label>
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-[200px]">
                          {currencies.map((c) => (
                            <button
                              key={c.code}
                              onClick={() => setCurrency(c.code)}
                              className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all",
                                currency === c.code
                                  ? "bg-primary border-primary text-white shadow-sm"
                                  : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {c.code}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors">
                          {currencies.find(c => c.code === currency)?.symbol}
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-14 h-20 text-4xl font-black tabular-nums bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-3xl transition-all tracking-tighter"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDate" className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/70 ml-1">Repayment Date</Label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="dueDate"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="pl-12 h-14 bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all font-bold"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold mb-1">Notes</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add context or purpose (optional)
                  </p>
                  <Textarea
                    id="notes"
                    placeholder="e.g. Laptop repair, inventory purchase..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[120px] bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all resize-none text-[15px]"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold mb-1">Payout Details</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Where should the funds be sent?
                  </p>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="region" className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/70 ml-1">Bank Region / Country</Label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center font-bold text-muted-foreground pointer-events-none">
                          🌐
                        </div>
                        <select
                          id="region"
                          value={currency}
                          onChange={(e) => {
                            setCurrency(e.target.value);
                            setBankName("");
                          }}
                          className="w-full pl-11 pr-4 h-14 bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all font-bold appearance-none outline-none"
                        >
                          {currencies.map(c => (
                            <option key={c.code} value={c.code}>{c.country}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground mr-1">
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/70 ml-1">Bank Name</Label>
                      <div className="relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                        <select
                          id="bankName"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full pl-11 pr-4 h-14 bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all font-bold appearance-none outline-none"
                        >
                          <option value="" disabled>Select a Bank</option>
                          {currentBanks.map(bank => (
                            <option key={bank} value={bank}>{bank}</option>
                          ))}
                          <option value="Other">Other Bank...</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground mr-1">
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountName" className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/70 ml-1">Account Name</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="accountName"
                          type="text"
                          placeholder="e.g. John Doe"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="pl-11 h-14 bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/70 ml-1">Account Number</Label>
                      <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="accountNumber"
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g. 0123456789"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="pl-11 h-14 bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-[11px] font-medium text-blue-900/70 leading-relaxed">
                        The borrower will see these details once they accept the invitation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-indigo-500 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
                    <Check className="w-10 h-10 text-white -rotate-12" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mb-2">Final Review</h2>
                  <p className="text-sm text-muted-foreground">Almost done! Confirm your loan details.</p>
                </div>

                <div className="bg-card border-2 border-border/50 rounded-3xl p-8 space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <FileText className="w-32 h-32" />
                  </div>

                  <div className="grid grid-cols-2 gap-8 relative z-10">
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 mb-2">Borrower</div>
                      <div className="font-bold text-lg">{borrowerName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 mb-2">Type</div>
                      <div className="font-bold flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", loanTypes.find(t => t.value === loanType)?.color)} />
                        {loanType.charAt(0).toUpperCase() + loanType.slice(1)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 mb-2">Amount</div>
                      <div className="text-5xl font-black tabular-nums tracking-tighter text-indigo-600">
                        {formatAmount(amount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 mb-2">Repayment Due</div>
                      <div className="font-bold text-lg">
                        {new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 mb-2">Payout Destination</div>
                      <div className="font-bold text-sm leading-relaxed text-slate-800">
                        {bankName} <br />
                        <span className="text-xs text-slate-900">{accountName}</span> <br />
                        <span className="text-xs text-slate-500">{accountNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Action - Glassmorphism */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-50">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-[2.5rem] p-3 shadow-2xl shadow-black/10"
          >
            <Button
              className={cn(
                "w-full h-16 rounded-[2rem] text-lg font-bold shadow-lg shadow-primary/20 transition-all",
                (step === 1 && (!loanType || !borrowerName)) ||
                  (step === 2 && (!amount || !dueDate)) ||
                  (step === 3 && (!bankName || !accountName || !accountNumber)) ||
                  isSubmitting
                  ? "opacity-50 grayscale"
                  : "hover:scale-[1.02] active:scale-[0.98]"
              )}
              onClick={step === 4 ? handleConfirm : handleNext}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? "Creating Record..." : (step === 4 ? "Confirm & Send Record" : "Continue")}</span>
              {!isSubmitting && <ChevronRight className="ml-2 w-5 h-5" />}
            </Button>
          </motion.div>
        </div>
      </div>
      <SuccessOverlay
        isOpen={isSuccessOpen}
        onClose={() => navigate("/dashboard")}
        onAction={() => navigate("/dashboard")}
        secondaryActionLabel="Share Invitation"
        onSecondaryAction={() => {
          const url = `https://progress-app.com/accept/${Math.random().toString(36).substring(7)}`;
          setShareUrl(url);
          setIsShareOpen(true);
        }}
        title="Loan Created!"
        message="Your new loan record has been successfully created and saved to your dashboard."
        details={[
          { label: "Borrower", value: borrowerName },
          { label: "Amount", value: `${currencies.find(c => c.code === currency)?.symbol}${amount}` },
          { label: "Payout to", value: `${bankName} • ${accountName} • ${accountNumber}` }
        ]}
        actionLabel="Back to Dashboard"
      />

      <ShareOverlay
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Invite Link Generated!"
        shareUrl={shareUrl}
        recipientName={borrowerName}
      />
    </div>
  );
}

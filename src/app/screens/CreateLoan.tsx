import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Check, User, Briefcase, Users, DollarSign, Calendar, FileText, ChevronRight, BellRing, BookmarkPlus, Sparkles, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoanSchema, type LoanFormData } from "../../lib/schemas";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { SuccessOverlay } from "../components/SuccessOverlay";
import { ShareOverlay } from "../components/ShareOverlay";
import { TemplateManager } from "../components/TemplateManager";
import { PaymentPlanConfig } from "../components/PaymentPlanConfig";
import { PlanConfig } from "../../lib/LoanCalculator";
import { cn } from "../components/ui/utils";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { analytics } from "../../lib/analytics";
import { logActivity } from "../../lib/logger";
import { secureEncrypt } from "../../lib/encryption";
import { getPrivacyKey } from "../../lib/privacyKeyStore";
import { useAuth } from "../../lib/contexts/AuthContext";

type LoanType = "personal" | "business" | "group";

export function CreateLoan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(LoanSchema) as any,
    defaultValues: {
      type: "personal",
      currency: "USD",
      borrower_name: "",
      amount: 0,
      due_date: "",
      note: "",
    },
  });

  const borrower_name = watch("borrower_name");
  const type = watch("type");
  const currency = watch("currency");
  const amount = watch("amount") || 0;
  const due_date = watch("due_date");
  const note = watch("note");

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Group State
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Template State
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  // Payment Plan State
  const [paymentPlan, setPaymentPlan] = useState<PlanConfig | null>(null);
  const [repaymentSchedule, setRepaymentSchedule] = useState<"one_time" | "installments">("one_time");

  // Contacts for Autocomplete
  const [contacts, setContacts] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Autosave Logic
  const allValues = watch();

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      const savedDraft = localStorage.getItem(`loan_draft_${user.id}`);
      if (savedDraft) {
        try {
          const { formData, bankName: bName, accountName: aName, accountNumber: aNum, selectedGroupId: sId, step: sStep } = JSON.parse(savedDraft);

          if (formData) {
            Object.entries(formData).forEach(([key, value]) => {
              setValue(key as any, value);
            });
          }

          if (bName) setBankName(bName);
          if (aName) setAccountName(aName);
          if (aNum) setAccountNumber(aNum);
          if (sId) setSelectedGroupId(sId);
          if (sStep) setStep(sStep);

          toast.info("Progress restored from draft", {
            description: "We've loaded your last unsaved loan record.",
            duration: 4000
          });
        } catch (e) {
          console.error("Failed to restore draft", e);
        }
      }
    };
    init();

    // Handle ?borrower=Name query parameter
    const params = new URLSearchParams(window.location.search);
    const borrowerName = params.get('borrower');
    if (borrowerName) {
      setValue('borrower_name', decodeURIComponent(borrowerName));
    }

    // Fetch contacts for autocomplete
    const fetchContacts = async () => {
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('last_loan_at', { ascending: false });
      if (data) setContacts(data);
    };
    fetchContacts();
  }, [user, setValue]);

  useEffect(() => {
    if (!user) return;

    const saveDraft = async () => {
      const draft = {
        formData: allValues,
        bankName,
        accountName,
        accountNumber,
        selectedGroupId,
        step,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`loan_draft_${user.id}`, JSON.stringify(draft));
    };

    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [allValues, bankName, accountName, accountNumber, selectedGroupId, step]);

  const filteredContacts = useMemo(() => {
    if (!borrower_name || !showAutocomplete) return [];
    return contacts.filter(c =>
      c.name.toLowerCase().includes(borrower_name.toLowerCase()) &&
      c.name.toLowerCase() !== borrower_name.toLowerCase()
    );
  }, [contacts, borrower_name, showAutocomplete]);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }

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

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await trigger(["type", "borrower_name"]);
      if (!isValid) return;

      if (type === 'group' && !selectedGroupId) {
        toast.error("Please select a group for this loan");
        return;
      }
    }

    if (step === 2) {
      const isValid = await trigger(["amount", "due_date"]);
      if (!isValid) return;
    }

    if (step < 5) {
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

      const privacyKey = getPrivacyKey();
      const encryptedDescription = await secureEncrypt(note || "Shared Ledger Loan", privacyKey);

      const { data, error } = await supabase.from('loans').insert([{
        lender_id: user.id,
        amount: amount,
        currency,
        status: 'PENDING',
        borrower_name: borrower_name,
        description: encryptedDescription,
        due_date: due_date ? new Date(due_date).toISOString() : null,
        type: type,
        group_id: type === 'group' ? selectedGroupId : null, // Link to group
        // Payment Plan Fields
        repayment_schedule: repaymentSchedule,
        installment_frequency: repaymentSchedule === 'installments' ? paymentPlan?.frequency : null,
        interest_rate: repaymentSchedule === 'installments' ? paymentPlan?.interestRate : 0,
        interest_type: repaymentSchedule === 'installments' ? paymentPlan?.interestType : 'simple',
        bank_details: {
          bankName,
          accountName,
          accountNumber
        }
      }])
        .select()
        .single();

      if (error) throw error;
      const newLoan = data;

      // Create installments if applicable
      if (repaymentSchedule === 'installments' && paymentPlan) {
        // We need to calculate installments client-side again or rely on the stored plan
        // For security/consistency, usually server-side is better, but here we do client-side creation
        const { calculateInstallments } = await import("../../lib/LoanCalculator");
        const installments = calculateInstallments(paymentPlan);

        const installmentsToInsert = installments.map(inst => ({
          loan_id: newLoan.id,
          installment_number: inst.number,
          due_date: inst.dueDate.toISOString(),
          amount_due: inst.amount,
          status: 'pending'
        }));

        const { error: instError } = await supabase.from('installments').insert(installmentsToInsert);
        if (instError) {
          console.error("Failed to create installments:", instError);
          toast.error("Loan created but failed to generate installments. Please contact support.");
        }
      }

      // Upsert into contacts table
      try {
        const { error: contactError } = await supabase
          .from('contacts')
          .upsert({
            user_id: user.id,
            name: borrower_name,
            last_loan_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,name'
          });

        if (contactError) console.error("Error upserting contact:", contactError);
      } catch (err) {
        console.error("Failed to update contacts:", err);
      }


      // Track loan creation in analytics
      if (data && data[0]) {
        await logActivity('LOAN_CREATED', `Created a new loan of ${currency} ${amount} for ${borrower_name}`, { loan_id: data[0].id });
        analytics.loanCreated(data[0].id, {
          type: type,
          amount: amount,
          currency,
          hasGroup: type === 'group' && !!selectedGroupId,
        });
      }

      // Create notification for creator
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          title: "Loan Record Created",
          message: `Your loan to ${borrower_name} for ${currency} ${amount} is now active.`,
          type: 'system',
          link_to: `/dashboard`
        }]);

      setIsSuccessOpen(true);
      toast.success("Loan successfully created!");

      // Clear draft on success
      localStorage.removeItem(`loan_draft_${user.id}`);
    } catch (error: any) {
      console.error("Error creating loan:", error);
      toast.error(error.message || "Failed to create loan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      setIsSavingTemplate(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('loan_templates').insert([{
        user_id: user.id,
        name: templateName,
        loan_type: type,
        currency,
        default_amount: amount || null,
        bank_name: bankName || null,
        account_name: accountName || null,
        notes: note || null,
      }]);

      if (error) throw error;

      analytics.templateSaved(templateName);
      toast.success(`Template "${templateName}" saved!`);
      setTemplateName("");
      setShowSaveTemplate(false);
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleLoadTemplate = (template: any) => {
    setValue("type", template.loan_type);
    if (template.currency) setValue("currency", template.currency);
    if (template.default_amount) setValue("amount", template.default_amount);
    if (template.bank_name) setBankName(template.bank_name);
    if (template.account_name) setAccountName(template.account_name);
    if (template.note) setValue("note", template.note);

    toast.success(`Template "${template.name}" loaded!`);
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
                  {[1, 2, 3, 4, 5].map((s) => (
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
                  Step {step} of 5
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0"
              onClick={() => setIsTemplateManagerOpen(true)}
              title="Load Template"
            >
              <BookmarkPlus className="w-5 h-5" />
            </Button>
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
                    {loanTypes.map((t) => {
                      const Icon = t.icon;
                      const isSelected = type === t.value;
                      return (
                        <button
                          key={t.value}
                          onClick={() => setValue("type", t.value)}
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
                              isSelected ? t.color + " text-white" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                            )}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-[15px] mb-0.5">{t.label}</div>
                              <div className="text-xs text-muted-foreground font-medium">
                                {t.description}
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
                            <div className={cn("absolute inset-y-0 left-0 w-1", t.color.replace('bg-', 'bg-'))} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Group Selection Dropdown */}
                  {type === 'group' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      <Label className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/70 ml-1 mb-2 block">
                        Select Group
                      </Label>

                      {groups.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {groups.map(group => (
                            <button
                              key={group.id}
                              onClick={() => setSelectedGroupId(group.id)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border text-sm font-bold transition-all",
                                selectedGroupId === group.id
                                  ? "bg-violet-50 border-violet-500 text-violet-700 shadow-sm"
                                  : "bg-white border-border text-slate-600 hover:border-violet-200"
                              )}
                            >
                              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                                <Users className="w-4 h-4" />
                              </div>
                              {group.name}
                              {selectedGroupId === group.id && <Check className="w-4 h-4 ml-auto text-violet-600" />}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                          <p className="text-sm font-bold text-amber-800 mb-2">No Groups Found</p>
                          <p className="text-xs text-amber-600 mb-3">You need to create a group first.</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white border-amber-200 text-amber-800 hover:bg-amber-100"
                            onClick={() => navigate('/groups')}
                          >
                            Create Group
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold mb-1">Borrower</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Who is this loan for?
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="borrower_name" className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/70 ml-1">Full Name or Phone</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="borrower_name"
                          type="text"
                          placeholder="e.g. Sarah Chen"
                          {...register("borrower_name")}
                          onFocus={() => setShowAutocomplete(true)}
                          onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                          className={cn(
                            "pl-11 h-14 bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all font-bold",
                            errors.borrower_name && "border-destructive ring-destructive/20 bg-destructive/5"
                          )}
                        />

                        <AnimatePresence>
                          {filteredContacts.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute z-[60] left-0 right-0 top-full mt-2 bg-white border border-border rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto no-scrollbar"
                            >
                              {filteredContacts.map(contact => (
                                <button
                                  key={contact.id}
                                  type="button"
                                  onClick={() => {
                                    setValue("borrower_name", contact.name);
                                    setShowAutocomplete(false);
                                  }}
                                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left"
                                >
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400">
                                    {contact.name.charAt(0)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-bold text-slate-900">{contact.name}</div>
                                    {contact.tags?.length > 0 && (
                                      <div className="text-[10px] text-slate-400 font-medium">
                                        {contact.tags.join(", ")}
                                      </div>
                                    )}
                                  </div>
                                  <Plus className="w-3 h-3 text-slate-300" />
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {errors.borrower_name && (
                        <p className="text-[10px] font-bold text-destructive ml-1 animate-pulse italic">{errors.borrower_name.message}</p>
                      )}
                    </div>
                    <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <BellRing className="w-5 h-5 text-indigo-600" />
                      </div>
                      <p className="text-[11px] font-medium text-indigo-900/70 leading-relaxed">
                        We'll notify {borrower_name || "the person"} so they can verify the terms and track payments.
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
                              type="button"
                              onClick={() => setValue("currency", c.code)}
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
                          {...register("amount", { valueAsNumber: true })}
                          className={cn(
                            "pl-14 h-20 text-4xl font-black tabular-nums bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-3xl transition-all tracking-tighter",
                            errors.amount && "border-destructive ring-destructive/20 bg-destructive/5"
                          )}
                        />
                      </div>
                      {errors.amount && (
                        <p className="text-[10px] font-bold text-destructive ml-1 animate-pulse italic">{errors.amount.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due_date" className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/70 ml-1">Repayment Date</Label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="due_date"
                          type="date"
                          {...register("due_date")}
                          className={cn(
                            "pl-12 h-14 bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all font-bold",
                            errors.due_date && "border-destructive ring-destructive/20 bg-destructive/5"
                          )}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      {errors.due_date && (
                        <p className="text-[10px] font-bold text-destructive ml-1 animate-pulse italic">{errors.due_date.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold mb-1">Notes</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add context or purpose (optional)
                  </p>
                  <Textarea
                    id="note"
                    placeholder="e.g. Laptop repair, inventory purchase..."
                    {...register("note")}
                    className="min-h-[120px] bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all resize-none text-[15px]"
                  />
                  {errors.note && (
                    <p className="text-[10px] font-bold text-destructive ml-1 mt-2 italic">{errors.note.message}</p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold mb-1">Repayment Plan</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Choose how this loan will be repaid
                  </p>

                  <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                    <button
                      onClick={() => setRepaymentSchedule("one_time")}
                      className={cn(
                        "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
                        repaymentSchedule === "one_time"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      One-time Payment
                    </button>
                    <button
                      onClick={() => setRepaymentSchedule("installments")}
                      className={cn(
                        "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
                        repaymentSchedule === "installments"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      Installments
                    </button>
                  </div>

                  {repaymentSchedule === "one_time" ? (
                    <div className="space-y-2">
                      <Label htmlFor="due_date" className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/70 ml-1">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        {...register("due_date")}
                        className="h-14 bg-muted/30 border-transparent rounded-2xl font-bold"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                      <PaymentPlanConfig
                        amount={amount || 0}
                        startDate={new Date()}
                        onChange={setPaymentPlan}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
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
                            setValue("currency", e.target.value);
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

            {step === 5 && (
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
                      <div className="font-bold text-lg">{borrower_name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 mb-2">Type</div>
                      <div className="font-bold flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", loanTypes.find(t => t.value === type)?.color)} />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                    </div>
                    {type === 'group' && (
                      <div className="col-span-2">
                        <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 mb-2">Group</div>
                        <div className="font-bold text-lg flex items-center gap-2 text-violet-700">
                          <Users className="w-4 h-4" />
                          {groups.find(g => g.id === selectedGroupId)?.name || "Unknown Group"}
                        </div>
                      </div>
                    )}
                    <div className="col-span-2">
                      <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 mb-2">Amount</div>
                      <div className="text-5xl font-black tabular-nums tracking-tighter text-indigo-600">
                        {formatAmount(amount.toString())}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 mb-2">Repayment Due</div>
                      <div className="font-bold text-lg">
                        {due_date ? new Date(due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Not set"}
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
                (step === 1 && (errors.borrower_name || !type || (type === 'group' && !selectedGroupId))) ||
                  (step === 2 && (errors.amount || errors.due_date)) ||
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
        secondaryActionLabel="Save as Template"
        onSecondaryAction={() => {
          setIsSuccessOpen(false);
          setShowSaveTemplate(true);
        }}
        title="Loan Created!"
        message="Your new loan record has been successfully created and saved to your dashboard."
        details={[
          { label: "Borrower", value: borrower_name },
          { label: type === 'group' ? "Group" : "Type", value: type === 'group' ? (groups.find(g => g.id === selectedGroupId)?.name || "Group") : "Personal" },
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
        recipientName={borrower_name}
      />

      <TemplateManager
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        onSelectTemplate={handleLoadTemplate}
      />

      {/* Save Template Dialog */}
      {showSaveTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Save as Template</h2>
                <p className="text-sm text-muted-foreground">Reuse this configuration later</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName" className="text-sm font-bold">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Monthly Business Loan"
                  className="mt-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveAsTemplate();
                  }}
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
                <p className="font-bold text-slate-700">This template will save:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  <li>Loan type: {type}</li>
                  <li>Currency: {currency}</li>
                  {amount > 0 && <li>Amount: {formatAmount(amount.toString())}</li>}
                  {bankName && <li>Bank: {bankName}</li>}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveTemplate(false);
                    setTemplateName("");
                  }}
                  className="flex-1"
                  disabled={isSavingTemplate}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAsTemplate}
                  className="flex-1"
                  disabled={isSavingTemplate || !templateName.trim()}
                >
                  {isSavingTemplate ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

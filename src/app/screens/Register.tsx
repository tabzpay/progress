import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Handshake,
    Mail,
    Lock,
    User,
    Smartphone,
    Shield,
    Briefcase,
    Eye,
    EyeOff,
    Globe,
    Clock,
    Target,
    DollarSign,
    MessageSquare,
    Search,
    Fingerprint,
    Sparkles,
    CircleDashed,
    Layers
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/ui/utils";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/contexts/AuthContext";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SEO } from "../components/SEO";
import { RegisterSchema, type RegisterFormData } from "../../lib/schemas";

type Step = "credentials" | "profile" | "preferences" | "intent";

const CURRENCIES = [
    { code: "USD", symbol: "$", label: "US Dollar" },
    { code: "NGN", symbol: "₦", label: "Nigerian Naira" },
    { code: "GHS", symbol: "₵", label: "Ghanaian Cedi" },
    { code: "KES", symbol: "KSh", label: "Kenyan Shilling" },
    { code: "EUR", symbol: "€", label: "Euro" },
    { code: "GBP", symbol: "£", label: "British Pound" },
];

const CHANNELS = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
    { id: "sms", label: "SMS", icon: Smartphone },
    { id: "email", label: "Email", icon: Mail },
];

const ATTRIBUTIONS = [
    "Social Media",
    "Friend/Family",
    "Search Engine",
    "News/Blog",
    "App Store",
    "Other"
];

export function Register() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, loading, navigate]);
    const [step, setStep] = useState<Step>("credentials");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        trigger,
        watch,
        setValue,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterSchema) as any,
        defaultValues: {
            email: "",
            password: "",
            full_name: "",
            phone: "",
            intent: undefined,
            occupation: "",
            currency: "USD",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            preferred_channel: "whatsapp",
            attribution: "",
            avatar_url: "",
        },
    });

    const email = watch("email");
    const password = watch("password");
    const full_name = watch("full_name");
    const phone = watch("phone");
    const intent = watch("intent");
    const occupation = watch("occupation");
    const currency = watch("currency");
    const timezone = watch("timezone");
    const preferred_channel = watch("preferred_channel");
    const attribution = watch("attribution");

    const handleRegister = async (data: RegisterFormData) => {
        setIsLoading(true);

        try {
            const { data: signUpData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.full_name,
                        phone: data.phone,
                        intent: data.intent,
                        occupation: data.occupation,
                        currency: data.currency,
                        timezone: data.timezone,
                        preferred_channel: data.preferred_channel,
                        attribution: data.attribution
                    }
                }
            });

            if (error) throw error;

            if (signUpData.user) {
                if (signUpData.session) {
                    toast.success("Account created! Welcome to Progress.");
                    navigate("/dashboard?welcome=true");
                } else {
                    toast.success("Account created! Please check your email for verification before signing in.");
                    navigate("/sign-in");
                }
            }
        } catch (error: any) {
            console.error("Registration error:", error);
            toast.error(error.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = async () => {
        if (step === "credentials") {
            const isValid = await trigger(["email", "password"]);
            if (isValid) setStep("profile");
        }
        else if (step === "profile") {
            const isValid = await trigger(["full_name", "occupation"]);
            if (isValid) setStep("preferences");
        }
        else if (step === "preferences") {
            const isValid = await trigger(["currency", "preferred_channel"]);
            if (isValid) setStep("intent");
        }
        else {
            handleSubmit(handleRegister)();
        }
    };

    const handleBack = () => {
        if (step === "profile") setStep("credentials");
        else if (step === "preferences") setStep("profile");
        else if (step === "intent") setStep("preferences");
    };

    // Password strength calculation
    const getPasswordStrength = (pwd: string) => {
        let strength = 0;
        if (!pwd) return 0;
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[^a-zA-Z\d]/.test(pwd)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(password || "");
    const getStrengthLabel = () => {
        if (passwordStrength <= 1) return { label: "Weak", color: "bg-red-500" };
        if (passwordStrength <= 3) return { label: "Fair", color: "bg-orange-500" };
        if (passwordStrength <= 4) return { label: "Good", color: "bg-yellow-500" };
        return { label: "Strong", color: "bg-green-500" };
    };

    return (
        <div className="min-h-screen bg-white selection:bg-indigo-50 relative">
            <SEO title="Join Progress" description="Create your account and start tracking your informal loans with precision." />
            {/* Minimalist Atmospheric Glows */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse [animation-delay:3s]" />
            </div>

            {/* Subtle Texture Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')]" />

            {/* Left Panel - Brand & Hero */}
            <div className="hidden lg:flex lg:w-[40%] xl:w-[35%] relative bg-slate-950 text-white p-12 lg:p-16 flex-col justify-between overflow-hidden shadow-2xl border-r border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 z-0" />

                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-3 text-white mb-16 group hover:opacity-90 transition-all">
                        <div className="bg-white/5 p-2.5 rounded-xl backdrop-blur-2xl border border-white/10 group-hover:scale-105 group-hover:bg-white/10 transition-all shadow-2xl shadow-black/40">
                            <Handshake className="w-6 h-6 text-blue-400/80" />
                        </div>
                        <span className="text-xl font-black tracking-[-0.05em] text-white">Progress</span>
                    </Link>

                    <div className="max-w-md">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                        >
                            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-[-0.03em] text-white">
                                Start your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">journey</span> <br />
                                to clarity.
                            </h1>
                            <p className="text-base text-slate-400 leading-relaxed font-medium mt-8 max-w-[90%]">
                                Sophisticated tools for personal lending. <br />
                                Maintain trust, track every detail.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Desktop Stepper - Minimalist */}
                <div className="relative z-10 w-full max-w-[280px]">
                    <div className="flex justify-between items-center mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-3">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        backgroundColor: ((step === "credentials" && i === 1) || (step === "profile" && i === 2) || (step === "preferences" && i === 3) || (step === "intent" && i === 4)) ? "#ffffff" :
                                            ((step === "profile" && i < 2) || (step === "preferences" && i < 3) || (step === "intent" && i < 4)) ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.03)"
                                    }}
                                    className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-700 border",
                                        ((step === "credentials" && i === 1) || (step === "profile" && i === 2) || (step === "preferences" && i === 3) || (step === "intent" && i === 4))
                                            ? "text-slate-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                            : (
                                                ((step === "profile" && i < 2) || (step === "preferences" && i < 3) || (step === "intent" && i < 4))
                                                    ? "text-blue-400 border-blue-400/30"
                                                    : "text-white/10 border-white/5"
                                            )
                                    )}
                                >
                                    {((step === "profile" && i < 2) || (step === "preferences" && i < 3) || (step === "intent" && i < 4))
                                        ? <Check className="w-4 h-4" />
                                        : <span className="text-[11px] font-bold">{i}</span>}
                                </motion.div>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest transition-all duration-500",
                                    ((step === "credentials" && i === 1) || (step === "profile" && i === 2) || (step === "preferences" && i === 3) || (step === "intent" && i === 4))
                                        ? "text-white"
                                        : "text-white/20"
                                )}>
                                    {i === 1 ? "Auth" : i === 2 ? "Info" : i === 3 ? "Setup" : "Done"}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-[1px] w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={false}
                            animate={{
                                width: step === "credentials" ? "25%" :
                                    step === "profile" ? "50%" :
                                        step === "preferences" ? "75%" : "100%"
                            }}
                            className="h-full bg-blue-400/80 shadow-[0_0_10px_rgba(96,165,250,0.4)]"
                        />
                    </div>
                </div>
            </div>

            {/* Right Panel - Content */}
            <div className="w-full lg:flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative z-10 overflow-y-auto bg-white">
                <div className="w-full max-w-sm">
                    {/* Mobile Progress (Minimal) */}
                    <div className="lg:hidden w-full mb-12">
                        <div className="flex justify-between items-center mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            <span>Step {step === "credentials" ? 1 : step === "profile" ? 2 : step === "preferences" ? 3 : 4} / 4</span>
                        </div>
                        <div className="h-[1px] w-full bg-slate-100 overflow-hidden">
                            <motion.div
                                animate={{ width: step === "credentials" ? "25%" : step === "profile" ? "50%" : step === "preferences" ? "75%" : "100%" }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* STEP 1: CREDENTIALS */}
                        {step === "credentials" && (
                            <motion.div
                                key="credentials"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
                                    <p className="text-sm text-muted-foreground">Enter your email and create a password.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                {...register("email")}
                                                className={cn(
                                                    "pl-10 h-11 text-sm",
                                                    errors.email && "border-red-500 bg-red-50/10"
                                                )}
                                                autoFocus
                                            />
                                        </div>
                                        {errors.email && <p className="text-sm text-red-500 font-medium ml-1">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder="Min. 8 characters"
                                                {...register("password")}
                                                className={cn(
                                                    "pl-10 pr-10 h-11 text-sm",
                                                    errors.password && "border-red-500 bg-red-50/10"
                                                )}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-sm text-red-500 font-medium ml-1">{errors.password.message}</p>}
                                        {password && (
                                            <div className="space-y-2">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <div
                                                            key={i}
                                                            className={cn(
                                                                "h-1 flex-1 rounded-full transition-all",
                                                                i <= passwordStrength ? getStrengthLabel().color : "bg-muted"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Password strength: <span className="font-medium">{getStrengthLabel().label}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-11"
                                    onClick={handleNext}
                                    disabled={!email || (password?.length || 0) < 8}
                                >
                                    Next Step <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>

                                <div className="text-center text-sm">
                                    Already have an account?{" "}
                                    <Link to="/sign-in" className="text-primary hover:underline font-medium">Log in</Link>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: PROFILE */}
                        {step === "profile" && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold tracking-tight">About you</h2>
                                    <p className="text-sm text-muted-foreground">Tell us a bit more about yourself.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                autoComplete="name"
                                                placeholder="e.g. Alex Rivera"
                                                {...register("full_name")}
                                                className={cn(
                                                    "pl-10 h-11 text-sm",
                                                    errors.full_name && "border-red-500 bg-red-50/10"
                                                )}
                                                autoFocus
                                            />
                                        </div>
                                        {errors.full_name && <p className="text-sm text-red-500 font-medium ml-1">{errors.full_name.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="occupation">Occupation / Industry</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="occupation"
                                                placeholder="e.g. Software Engineer"
                                                {...register("occupation")}
                                                className="pl-10 h-11 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="(555) 000-0000"
                                                {...register("phone")}
                                                className="pl-10 h-11 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 border-slate-200"
                                        onClick={handleBack}
                                        type="button"
                                    >
                                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                    </Button>
                                    <Button
                                        className="flex-[2] h-12"
                                        onClick={handleNext}
                                        disabled={!full_name}
                                    >
                                        Next Step <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: PREFERENCES */}
                        {step === "preferences" && (
                            <motion.div
                                key="preferences"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold tracking-tight">Preferences</h2>
                                    <p className="text-sm text-muted-foreground">Optimize your experience.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Primary Currency</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {CURRENCIES.map((curr) => (
                                                <button
                                                    key={curr.code}
                                                    type="button"
                                                    onClick={() => setValue("currency", curr.code)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300",
                                                        currency === curr.code
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                                                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <span className="text-xl font-bold">{curr.symbol}</span>
                                                    <span className={cn(
                                                        "text-[9px] uppercase font-black tracking-widest mt-1",
                                                        currency === curr.code ? "text-white/60" : "text-slate-400"
                                                    )}>{curr.code}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Preferred Communication</Label>
                                        <div className="flex gap-3">
                                            {CHANNELS.map((channel) => (
                                                <button
                                                    key={channel.id}
                                                    type="button"
                                                    onClick={() => setValue("preferred_channel", channel.id as any)}
                                                    className={cn(
                                                        "flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300",
                                                        preferred_channel === channel.id
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                                                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <channel.icon className={cn("w-4 h-4", preferred_channel === channel.id ? "text-white" : "text-slate-400")} />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider">{channel.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Local Timezone</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <select
                                                id="timezone"
                                                {...register("timezone")}
                                                className="w-full pl-10 h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
                                                <option value="UTC">UTC</option>
                                                <option value="Africa/Lagos">Africa/Lagos (West Africa Time)</option>
                                                <option value="Africa/Accra">Africa/Accra (Greenwich Mean Time)</option>
                                                <option value="US/Eastern">US Eastern Time</option>
                                                <option value="Europe/London">Europe/London</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 border-slate-200"
                                        onClick={handleBack}
                                        type="button"
                                    >
                                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                    </Button>
                                    <Button
                                        className="flex-[2] h-12"
                                        onClick={handleNext}
                                    >
                                        Next Step <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: INTENT & ATTRIBUTION */}
                        {step === "intent" && (
                            <motion.div
                                key="intent"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold tracking-tight">Final Details</h2>
                                    <p className="text-sm text-muted-foreground">What brings you to Progress?</p>
                                </div>

                                <div className="grid gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setValue("intent", "lend")}
                                        className={cn(
                                            "flex items-center gap-5 p-4 rounded-2xl border transition-all duration-300 group",
                                            intent === "lend"
                                                ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200"
                                                : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                            intent === "lend" ? "bg-white/10 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
                                        )}>
                                            <Handshake className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className={cn("font-bold text-sm tracking-tight", intent === "lend" ? "text-white" : "text-slate-900")}>Track Lending</div>
                                            <p className={cn("text-[11px] font-medium mt-0.5", intent === "lend" ? "text-white/60" : "text-slate-400")}>Focus on money given to others.</p>
                                        </div>
                                        {intent === 'lend' && <Check className="w-4 h-4 text-blue-400" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setValue("intent", "borrow")}
                                        className={cn(
                                            "flex items-center gap-5 p-4 rounded-2xl border transition-all duration-300 group",
                                            intent === "borrow"
                                                ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200"
                                                : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                            intent === "borrow" ? "bg-white/10 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
                                        )}>
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className={cn("font-bold text-sm tracking-tight", intent === "borrow" ? "text-white" : "text-slate-900")}>Track Borrowing</div>
                                            <p className={cn("text-[11px] font-medium mt-0.5", intent === "borrow" ? "text-white/60" : "text-slate-400")}>Keep records for money received.</p>
                                        </div>
                                        {intent === 'borrow' && <Check className="w-4 h-4 text-blue-400" />}
                                    </button>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <Label className="flex items-center gap-2">
                                        <Search className="w-4 h-4 text-muted-foreground" />
                                        How did you hear about us?
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {ATTRIBUTIONS.map((source) => (
                                            <button
                                                key={source}
                                                type="button"
                                                onClick={() => setValue("attribution", source)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all",
                                                    attribution === source ? "bg-primary border-primary text-white" : "border-border hover:bg-muted"
                                                )}
                                            >
                                                {source}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 border-slate-200"
                                        onClick={handleBack}
                                        type="button"
                                        disabled={isLoading}
                                    >
                                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                    </Button>
                                    <Button
                                        className="flex-[2] h-12"
                                        onClick={handleNext}
                                        disabled={!intent || isLoading}
                                    >
                                        {isLoading ? "creating account..." : "Finish Setup"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === "credentials" && (
                        <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-10 max-w-[80%] mx-auto leading-relaxed">
                            Secured by <span className="text-slate-900">Supabase Auth</span> <br />
                            By continuing, you agree to our <Link to="/terms" className="underline hover:text-primary">Terms</Link> and <Link to="/privacy" className="underline hover:text-primary">Privacy</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

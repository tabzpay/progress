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
    Briefcase,
    Eye,
    EyeOff,
    Clock,
    TrendingUp,
    DollarSign,
    CheckCircle2,
    MessageSquare
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
import { SEO } from "../components/layout/SEO";
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

    const [focusedField, setFocusedField] = useState<string | null>(null);

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
        <div className="min-h-screen bg-white selection:bg-indigo-50 relative lg:flex">
            <SEO title="Join Progress" description="Create your account and start tracking your informal loans with precision." />
            {/* Minimalist Atmospheric Glows */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse [animation-delay:3s]" />
            </div>

            {/* Subtle Texture Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')]" />

            {/* Left Panel - Brand & Hero - Updated to match SignIn */}
            <div className="hidden lg:flex lg:w-[40%] xl:w-[35%] relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white p-12 lg:p-16 flex-col justify-between overflow-hidden shadow-2xl border-r border-white/5">
                {/* Enhanced Animated Background */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-blue-500/20 to-purple-600/20 z-0"
                    animate={{
                        background: [
                            "linear-gradient(to bottom right, rgba(99, 102, 241, 0.2), rgba(37, 99, 235, 0.2), rgba(126, 34, 206, 0.2))",
                            "linear-gradient(to bottom right, rgba(126, 34, 206, 0.2), rgba(99, 102, 241, 0.2), rgba(37, 99, 235, 0.2))",
                            "linear-gradient(to bottom right, rgba(37, 99, 235, 0.2), rgba(126, 34, 206, 0.2), rgba(99, 102, 241, 0.2))",
                        ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Floating orbs */}
                <motion.div
                    className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px]"
                    animate={{
                        x: [50, -50, 50],
                        y: [-50, 50, -50],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-[100px]"
                    animate={{
                        x: [-30, 30, -30],
                        y: [30, -30, 30],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-300/10 rounded-full blur-[80px]"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -50, 0],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-3 text-white mb-16 group hover:opacity-90 transition-all">
                        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 shadow-lg shadow-black/10">
                            <Handshake className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white/95 drop-shadow-sm">Progress</span>
                    </Link>

                    <div className="max-w-md">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                        >
                            <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-[-0.03em] text-white drop-shadow-md">
                                Start your <br />
                                <span className="text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-indigo-100 drop-shadow-none animate-pulse">journey</span> <br />
                                to clarity.
                            </h1>
                            <p className="text-lg text-blue-50/80 leading-relaxed font-medium mt-8 max-w-[90%] drop-shadow-sm">
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
                                            ((step === "profile" && i < 2) || (step === "preferences" && i < 3) || (step === "intent" && i < 4)) ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"
                                    }}
                                    className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-700 border backdrop-blur-sm",
                                        ((step === "credentials" && i === 1) || (step === "profile" && i === 2) || (step === "preferences" && i === 3) || (step === "intent" && i === 4))
                                            ? "text-indigo-600 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-110"
                                            : (
                                                ((step === "profile" && i < 2) || (step === "preferences" && i < 3) || (step === "intent" && i < 4))
                                                    ? "text-white border-white/40"
                                                    : "text-white/40 border-white/20"
                                            )
                                    )}
                                >
                                    {((step === "profile" && i < 2) || (step === "preferences" && i < 3) || (step === "intent" && i < 4))
                                        ? <Check className="w-4 h-4" />
                                        : <span className="text-[11px] font-bold">{i}</span>}
                                </motion.div>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest transition-all duration-500 drop-shadow-sm",
                                    ((step === "credentials" && i === 1) || (step === "profile" && i === 2) || (step === "preferences" && i === 3) || (step === "intent" && i === 4))
                                        ? "text-white scale-105"
                                        : "text-blue-100/40"
                                )}>
                                    {i === 1 ? "Auth" : i === 2 ? "Info" : i === 3 ? "Setup" : "Done"}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                        <motion.div
                            initial={false}
                            animate={{
                                width: step === "credentials" ? "25%" :
                                    step === "profile" ? "50%" :
                                        step === "preferences" ? "75%" : "100%"
                            }}
                            className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                        />
                    </div>
                </div>
            </div>

            {/* Right Panel - Content */}
            <div className="w-full lg:flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative z-10 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
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
                                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Create account</h2>
                                    <p className="text-base text-muted-foreground">Enter your email and create a password.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Mail className={cn(
                                                "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-200",
                                                focusedField === "email" || email ? "text-primary" : "text-muted-foreground"
                                            )} />
                                            <Input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder=""
                                                {...register("email")}
                                                onFocus={() => setFocusedField("email")}
                                                onBlur={() => setFocusedField(null)}
                                                className={cn(
                                                    "pl-10 h-14 text-base transition-all duration-300 border-2",
                                                    focusedField === "email" && "ring-4 ring-primary/10 border-primary shadow-lg shadow-primary/5",
                                                    errors.email && "border-red-500 bg-red-50/10 focus:ring-red-500/10"
                                                )}
                                                autoFocus
                                            />
                                            <Label
                                                htmlFor="email"
                                                className={cn(
                                                    "absolute left-10 transition-all duration-200 pointer-events-none bg-inherit px-1",
                                                    focusedField === "email" || email
                                                        ? "-top-2.5 text-xs text-primary font-medium bg-white"
                                                        : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                                                )}
                                            >
                                                Email Address
                                            </Label>
                                        </div>
                                        {errors.email && <p className="text-sm text-red-500 font-medium ml-1">{errors.email.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Lock className={cn(
                                                "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-200",
                                                focusedField === "password" || password ? "text-primary" : "text-muted-foreground"
                                            )} />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder=""
                                                {...register("password")}
                                                onFocus={() => setFocusedField("password")}
                                                onBlur={() => setFocusedField(null)}
                                                className={cn(
                                                    "pl-10 pr-10 h-14 text-base transition-all duration-300 border-2",
                                                    focusedField === "password" && "ring-4 ring-primary/10 border-primary shadow-lg shadow-primary/5",
                                                    errors.password && "border-red-500 bg-red-50/10 focus:ring-red-500/10"
                                                )}
                                            />
                                            <Label
                                                htmlFor="password"
                                                className={cn(
                                                    "absolute left-10 transition-all duration-200 pointer-events-none bg-inherit px-1",
                                                    focusedField === "password" || password
                                                        ? "-top-2.5 text-xs text-primary font-medium bg-white"
                                                        : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                                                )}
                                            >
                                                Create Password
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-sm text-red-500 font-medium ml-1">{errors.password.message}</p>}
                                        {password && (
                                            <div className="space-y-2 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex gap-1 mb-1">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <div
                                                            key={i}
                                                            className={cn(
                                                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                                                i <= passwordStrength ? getStrengthLabel().color : "bg-slate-200"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium flex justify-between">
                                                    <span>Security Strength:</span>
                                                    <span className={cn("font-bold", `text-${getStrengthLabel().color.split('-')[1]}-600`)}>{getStrengthLabel().label}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 text-base font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] rounded-xl"
                                    onClick={handleNext}
                                    disabled={!email || (password?.length || 0) < 8}
                                >
                                    Next Step <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>

                                <div className="text-center text-sm">
                                    Already have an account?{" "}
                                    <Link to="/sign-in" className="text-indigo-600 hover:text-indigo-700 hover:underline font-bold transition-colors">Log in</Link>
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
                                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">About you</h2>
                                    <p className="text-base text-muted-foreground">Tell us a bit more about yourself.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <User className={cn(
                                                "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-200",
                                                focusedField === "full_name" || full_name ? "text-primary" : "text-muted-foreground"
                                            )} />
                                            <Input
                                                id="name"
                                                autoComplete="name"
                                                placeholder=""
                                                {...register("full_name")}
                                                onFocus={() => setFocusedField("full_name")}
                                                onBlur={() => setFocusedField(null)}
                                                className={cn(
                                                    "pl-10 h-14 text-base transition-all duration-300 border-2",
                                                    focusedField === "full_name" && "ring-4 ring-primary/10 border-primary shadow-lg shadow-primary/5",
                                                    errors.full_name && "border-red-500 bg-red-50/10 focus:ring-red-500/10"
                                                )}
                                                autoFocus
                                            />
                                            <Label
                                                htmlFor="name"
                                                className={cn(
                                                    "absolute left-10 transition-all duration-200 pointer-events-none bg-inherit px-1",
                                                    focusedField === "full_name" || full_name
                                                        ? "-top-2.5 text-xs text-primary font-medium bg-white"
                                                        : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                                                )}
                                            >
                                                Full Name
                                            </Label>
                                        </div>
                                        {errors.full_name && <p className="text-sm text-red-500 font-medium ml-1">{errors.full_name.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Briefcase className={cn(
                                                "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-200",
                                                focusedField === "occupation" || occupation ? "text-primary" : "text-muted-foreground"
                                            )} />
                                            <Input
                                                id="occupation"
                                                placeholder=""
                                                {...register("occupation")}
                                                onFocus={() => setFocusedField("occupation")}
                                                onBlur={() => setFocusedField(null)}
                                                className={cn(
                                                    "pl-10 h-14 text-base transition-all duration-300 border-2",
                                                    focusedField === "occupation" && "ring-4 ring-primary/10 border-primary shadow-lg shadow-primary/5"
                                                )}
                                            />
                                            <Label
                                                htmlFor="occupation"
                                                className={cn(
                                                    "absolute left-10 transition-all duration-200 pointer-events-none bg-inherit px-1",
                                                    focusedField === "occupation" || occupation
                                                        ? "-top-2.5 text-xs text-primary font-medium bg-white"
                                                        : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                                                )}
                                            >
                                                Occupation / Industry
                                            </Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Smartphone className={cn(
                                                "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-200",
                                                focusedField === "phone" || phone ? "text-primary" : "text-muted-foreground"
                                            )} />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder=""
                                                {...register("phone")}
                                                onFocus={() => setFocusedField("phone")}
                                                onBlur={() => setFocusedField(null)}
                                                className={cn(
                                                    "pl-10 h-14 text-base transition-all duration-300 border-2",
                                                    focusedField === "phone" && "ring-4 ring-primary/10 border-primary shadow-lg shadow-primary/5"
                                                )}
                                            />
                                            <Label
                                                htmlFor="phone"
                                                className={cn(
                                                    "absolute left-10 transition-all duration-200 pointer-events-none bg-inherit px-1",
                                                    focusedField === "phone" || phone
                                                        ? "-top-2.5 text-xs text-primary font-medium bg-white"
                                                        : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                                                )}
                                            >
                                                Phone Number
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold rounded-xl"
                                        onClick={handleBack}
                                        type="button"
                                    >
                                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                    </Button>
                                    <Button
                                        className="flex-[2] h-14 text-base font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] rounded-xl"
                                        onClick={handleNext}
                                        disabled={!full_name}
                                    >
                                        Next Step <ArrowRight className="ml-2 w-5 h-5" />
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
                                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Preferences</h2>
                                    <p className="text-base text-muted-foreground">Optimize your experience.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Primary Currency</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {CURRENCIES.map((curr) => (
                                                <button
                                                    key={curr.code}
                                                    type="button"
                                                    onClick={() => setValue("currency", curr.code)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group",
                                                        currency === curr.code
                                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                                                            : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30"
                                                    )}
                                                >
                                                    {currency === curr.code && (
                                                        <motion.div
                                                            layoutId="activeCurrency"
                                                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-600 -z-10"
                                                        />
                                                    )}
                                                    <span className="text-xl font-black mb-1">{curr.symbol}</span>
                                                    <span className={cn(
                                                        "text-[10px] uppercase font-bold tracking-widest",
                                                        currency === curr.code ? "text-white/80" : "text-slate-400 group-hover:text-indigo-500"
                                                    )}>{curr.code}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Preferred Channel</Label>
                                        <div className="flex gap-3">
                                            {CHANNELS.map((channel) => (
                                                <button
                                                    key={channel.id}
                                                    type="button"
                                                    onClick={() => setValue("preferred_channel", channel.id as any)}
                                                    className={cn(
                                                        "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group",
                                                        preferred_channel === channel.id
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200 scale-105"
                                                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <channel.icon className={cn("w-4 h-4", preferred_channel === channel.id ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider">{channel.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="timezone" className="text-sm font-bold text-slate-700 uppercase tracking-wide">Timezone</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                            <select
                                                id="timezone"
                                                {...register("timezone")}
                                                className="w-full pl-10 h-14 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-300"
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

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold rounded-xl"
                                        onClick={handleBack}
                                        type="button"
                                    >
                                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                    </Button>
                                    <Button
                                        className="flex-[2] h-14 text-base font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] rounded-xl"
                                        onClick={handleNext}
                                    >
                                        Next Step <ArrowRight className="ml-2 w-5 h-5" />
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
                                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Final Step</h2>
                                    <p className="text-base text-muted-foreground">What brings you to Progress?</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700 uppercase tracking-wide">I want to...</Label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { id: "lend", label: "Lend money to others", icon: TrendingUp, desc: "Track loans given to friends & family" },
                                                { id: "borrow", label: "Borrow money", icon: DollarSign, desc: "Manage repayments and build trust" },
                                                { id: "both", label: "Manage existing loans", icon: Handshake, desc: "Organize both lending and borrowing" },
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setValue("intent", item.id as any)}
                                                    className={cn(
                                                        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group text-left",
                                                        intent === item.id
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]"
                                                            : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "p-3 rounded-xl transition-colors",
                                                        intent === item.id ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100/50 group-hover:text-indigo-600"
                                                    )}>
                                                        <item.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <span className="block text-base font-bold">{item.label}</span>
                                                        <span className={cn(
                                                            "block text-xs",
                                                            intent === item.id ? "text-white/70" : "text-slate-400"
                                                        )}>{item.desc}</span>
                                                    </div>
                                                    {intent === item.id && (
                                                        <motion.div
                                                            layoutId="activeIntent"
                                                            className="absolute right-4 text-white"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                        >
                                                            <CheckCircle2 className="w-6 h-6" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700 uppercase tracking-wide">How did you hear about us?</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Friend / Family", "Social Media", "Search Engine", "Advertisement", "Other"].map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => setValue("attribution", option)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200",
                                                        attribution === option
                                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                                    )}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold rounded-xl"
                                        onClick={handleBack}
                                        type="button"
                                    >
                                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                    </Button>
                                    <Button
                                        className="flex-[2] h-14 text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-[1.02] rounded-xl"
                                        onClick={handleSubmit(handleRegister)}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                Creating account...
                                            </span>
                                        ) : (
                                            <>
                                                Finish Setup <CheckCircle2 className="ml-2 w-5 h-5" />
                                            </>
                                        )}
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

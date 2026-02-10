import { useState } from "react";
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
    EyeOff
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/ui/utils";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterFormData } from "../../lib/schemas";

type Step = "credentials" | "profile" | "intent";

export function Register() {
    const navigate = useNavigate();
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
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            full_name: "",
            phone: "",
            intent: undefined,
        },
    });

    const email = watch("email");
    const password = watch("password");
    const full_name = watch("full_name");
    const phone = watch("phone");
    const intent = watch("intent");

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
                        intent: data.intent
                    }
                }
            });

            if (error) throw error;

            if (signUpData.user) {
                if (signUpData.session) {
                    toast.success("Account created! Welcome to Progress.");
                    navigate("/dashboard");
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
            const isValid = await trigger(["full_name"]);
            if (isValid) setStep("intent");
        }
        else {
            handleSubmit(handleRegister)();
        }
    };

    const handleBack = () => {
        if (step === "intent") setStep("profile");
        else if (step === "profile") setStep("credentials");
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
        <div className="min-h-screen bg-background flex overflow-hidden">
            {/* Left Panel - Marketing (Same as Auth for consistency, but maybe slightly tweaked text) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary text-primary-foreground p-12 flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 z-0" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] transform -translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-white mb-12 hover:opacity-80 transition-opacity">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Handshake className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Progress</span>
                    </Link>

                    <div className="max-w-md">
                        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                            Start your journey to clarity.
                        </h1>
                        <p className="text-lg text-primary-foreground/90 leading-relaxed mb-8">
                            Create an account to track loans, send reminders, and keep your relationships strong.
                        </p>
                    </div>
                </div>

                {/* Step Indicator (Desktop) */}
                <div className="relative z-10 flex gap-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1 w-8 rounded-full transition-all duration-300",
                                (step === "credentials" && i === 1) ||
                                    (step === "profile" && i <= 2) ||
                                    (step === "intent" && i <= 3)
                                    ? "bg-white"
                                    : "bg-white/20"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Right Panel - Form Wizard */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
                <div className="w-full max-w-sm">
                    {/* Mobile Back / Step Header */}
                    <div className="flex items-center justify-between mb-8">
                        {step !== "credentials" ? (
                            <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-3">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                        ) : (
                            <div />
                        )}
                        <span className="text-sm text-muted-foreground lg:hidden">
                            Step {step === "credentials" ? 1 : step === "profile" ? 2 : 3} of 3
                        </span>
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
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
                                    <p className="text-muted-foreground">Enter your email and create a password.</p>
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
                                                    "pl-10 h-12",
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
                                                    "pl-10 pr-10 h-12",
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
                                    className="w-full h-12"
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
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tight">About you</h2>
                                    <p className="text-muted-foreground">This helps us personalize your agreements.</p>
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
                                                    "pl-10 h-12",
                                                    errors.full_name && "border-red-500 bg-red-50/10"
                                                )}
                                                autoFocus
                                            />
                                        </div>
                                        {errors.full_name && <p className="text-sm text-red-500 font-medium ml-1">{errors.full_name.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="phone">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                        </div>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                autoComplete="tel"
                                                placeholder="(555) 000-0000"
                                                {...register("phone")}
                                                className="pl-10 h-12"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">We'll only use this for important reminders you enable.</p>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12"
                                    onClick={handleNext}
                                    disabled={!full_name}
                                >
                                    Next Step <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </motion.div>
                        )}

                        {/* STEP 3: INTENT */}
                        {step === "intent" && (
                            <motion.div
                                key="intent"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tight">What brings you here?</h2>
                                    <p className="text-muted-foreground">We'll set up your dashboard based on your goal.</p>
                                </div>

                                <div className="grid gap-4">
                                    <button
                                        onClick={() => setValue("intent", "lend")}
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all hover:bg-muted/50",
                                            intent === "lend" ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <div className="bg-primary/10 p-2.5 rounded-lg flex-shrink-0">
                                            <Handshake className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg flex items-center justify-between w-full">
                                                I want to lend money
                                                {intent === 'lend' && <Check className="w-5 h-5 text-primary" />}
                                            </div>
                                            <p className="text-muted-foreground text-sm mt-1">Track a loan I'm giving to a friend or family member.</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setValue("intent", "borrow")}
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all hover:bg-muted/50",
                                            intent === "borrow" ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <div className="bg-blue-500/10 p-2.5 rounded-lg flex-shrink-0">
                                            <Briefcase className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg flex items-center justify-between w-full">
                                                I want to borrow money
                                                {intent === 'borrow' && <Check className="w-5 h-5 text-primary" />}
                                            </div>
                                            <p className="text-muted-foreground text-sm mt-1">Create a formal record for money I'm receiving.</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setValue("intent", "explore")}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:bg-muted/50",
                                            intent === "explore" ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <div className="bg-muted p-2.5 rounded-lg flex-shrink-0">
                                            <Shield className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div className="font-medium">
                                            Just looking around for now
                                        </div>
                                        {intent === 'explore' && <Check className="ml-auto w-5 h-5 text-primary" />}
                                    </button>
                                </div>

                                <Button
                                    className="w-full h-12"
                                    onClick={handleNext}
                                    disabled={!intent || isLoading}
                                >
                                    {isLoading ? "creating account..." : "Finish Setup"}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === "credentials" && (
                        <p className="text-xs text-center text-muted-foreground mt-8">
                            By creating an account, you agree to our{" "}
                            <Link to="/terms" className="underline hover:text-foreground">Terms</Link>{" "}
                            and{" "}
                            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

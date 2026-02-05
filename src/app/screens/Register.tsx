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

type Step = "credentials" | "profile" | "intent";

export function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>("credentials");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "", fullName: "", general: "" });

    // Form State
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        intent: "" as "lend" | "borrow" | "explore" | ""
    });

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRegister = async () => {
        setIsLoading(true);
        setErrors(prev => ({ ...prev, general: "" }));

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        intent: formData.intent
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                if (data.session) {
                    toast.success("Account created! Welcome to Progress.");
                    navigate("/dashboard");
                } else {
                    toast.success("Account created! Please check your email for verification before signing in.");
                    navigate("/sign-in");
                }
            }
        } catch (error: any) {
            console.error("Registration error:", error);
            setErrors(prev => ({ ...prev, general: error.message || "Failed to register" }));
            toast.error(error.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        setErrors({ email: "", password: "", fullName: "", general: "" });

        if (step === "credentials") {
            // Validate credentials
            let hasError = false;
            if (!formData.email) {
                setErrors(prev => ({ ...prev, email: "Email is required" }));
                hasError = true;
            } else if (!validateEmail(formData.email)) {
                setErrors(prev => ({ ...prev, email: "Please enter a valid email" }));
                hasError = true;
            }

            if (!formData.password || formData.password.length < 8) {
                setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters" }));
                hasError = true;
            }

            if (hasError) return;
            setStep("profile");
        }
        else if (step === "profile") {
            if (!formData.fullName) {
                setErrors(prev => ({ ...prev, fullName: "Name is required" }));
                return;
            }
            setStep("intent");
        }
        else {
            handleRegister();
        }
    };

    const handleBack = () => {
        if (step === "intent") setStep("profile");
        else if (step === "profile") setStep("credentials");
    };

    // Password strength calculation
    const getPasswordStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[^a-zA-Z\d]/.test(pwd)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);
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
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                className={`pl-10 h-12 ${errors.email ? 'border-red-500' : ''}`}
                                                value={formData.email}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    setErrors(prev => ({ ...prev, email: "" }));
                                                }}
                                                autoFocus
                                            />
                                        </div>
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                className={`pl-10 pr-10 h-12 ${errors.password ? 'border-red-500' : ''}`}
                                                placeholder="Min. 8 characters"
                                                value={formData.password}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, password: e.target.value });
                                                    setErrors(prev => ({ ...prev, password: "" }));
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                        {formData.password && (
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
                                    disabled={!formData.email || formData.password.length < 8}
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
                                                name="name"
                                                autoComplete="name"
                                                placeholder="e.g. Alex Rivera"
                                                className={`pl-10 h-12 ${errors.fullName ? 'border-red-500' : ''}`}
                                                value={formData.fullName}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, fullName: e.target.value });
                                                    setErrors(prev => ({ ...prev, fullName: "" }));
                                                }}
                                                autoFocus
                                            />
                                        </div>
                                        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="phone">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                        </div>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                name="tel"
                                                type="tel"
                                                autoComplete="tel"
                                                className="pl-10 h-12"
                                                placeholder="(555) 000-0000"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">We'll only use this for important reminders you enable.</p>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12"
                                    onClick={handleNext}
                                    disabled={!formData.fullName}
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
                                        onClick={() => setFormData({ ...formData, intent: "lend" })}
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all hover:bg-muted/50",
                                            formData.intent === "lend" ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <div className="bg-primary/10 p-2.5 rounded-lg flex-shrink-0">
                                            <Handshake className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg flex items-center justify-between w-full">
                                                I want to lend money
                                                {formData.intent === 'lend' && <Check className="w-5 h-5 text-primary" />}
                                            </div>
                                            <p className="text-muted-foreground text-sm mt-1">Track a loan I'm giving to a friend or family member.</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setFormData({ ...formData, intent: "borrow" })}
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all hover:bg-muted/50",
                                            formData.intent === "borrow" ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <div className="bg-blue-500/10 p-2.5 rounded-lg flex-shrink-0">
                                            <Briefcase className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg flex items-center justify-between w-full">
                                                I want to borrow money
                                                {formData.intent === 'borrow' && <Check className="w-5 h-5 text-primary" />}
                                            </div>
                                            <p className="text-muted-foreground text-sm mt-1">Create a formal record for money I'm receiving.</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setFormData({ ...formData, intent: "explore" })}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:bg-muted/50",
                                            formData.intent === "explore" ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <div className="bg-muted p-2.5 rounded-lg flex-shrink-0">
                                            <Shield className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div className="font-medium">
                                            Just looking around for now
                                        </div>
                                        {formData.intent === 'explore' && <Check className="ml-auto w-5 h-5 text-primary" />}
                                    </button>
                                </div>

                                <Button
                                    className="w-full h-12"
                                    onClick={handleNext}
                                    disabled={!formData.intent || isLoading}
                                >
                                    {isLoading ? "creating account..." : "Finish Setup"}
                                </Button>
                                {errors.general && <p className="text-sm text-red-500 text-center">{errors.general}</p>}
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

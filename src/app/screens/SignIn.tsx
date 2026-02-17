import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Handshake, ArrowRight, Check, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { motion } from "motion/react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginFormData } from "../../lib/schemas";
import { supabase } from "../../lib/supabase";
import { SEO } from "../components/layout/SEO";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";
import { logActivity } from "../../lib/logger";
import { useAuth } from "../../lib/contexts/AuthContext";

export function SignIn() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, loading, navigate]);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<LoginFormData>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const emailValue = watch("email");
    const passwordValue = watch("password");

    const handleLogin = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const { data: signInData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) throw error;

            if (signInData.session) {
                // Check if MFA is required
                const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
                if (factorsError) throw factorsError;

                const verifiedFactors = factors.all.filter(f => f.status === 'verified');
                if (verifiedFactors.length > 0) {
                    await logActivity('LOGIN', 'User authenticated with MFA check pending');
                    // Redirect to MFA verification screen
                    navigate("/mfa-verify", { state: { factorId: verifiedFactors[0].id } });
                } else {
                    await logActivity('LOGIN', 'User successfully signed in');
                    toast.success("Welcome back!");
                    navigate("/dashboard");
                }
            }
        } catch (error: any) {
            console.error("Login error:", error);

            let message = "Invalid email or password";
            if (error.message?.includes("Email not confirmed")) {
                message = "Please check your inbox to confirm your email address before signing in.";
            } else if (error.message) {
                message = error.message;
            }

            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white relative selection:bg-indigo-50 lg:flex">
            <SEO title="Sign In" description="Securely access your Progress account." />
            {/* Left Panel - Marketing (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white p-12 flex-col justify-between overflow-hidden">
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
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link to="/" className="inline-flex items-center gap-2 text-white mb-12 hover:opacity-80 transition-opacity group">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                                <Handshake className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Progress</span>
                        </Link>
                    </motion.div>

                    <div className="max-w-md">
                        <motion.h1
                            className="text-6xl font-extrabold mb-6 leading-tight tracking-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            Welcome back.
                        </motion.h1>
                        <motion.p
                            className="text-xl text-white/90 leading-relaxed mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Sign in to manage your loans, check repayment status, and keep your finances on track.
                        </motion.p>

                        <div className="space-y-4">
                            {[
                                "Secure, private access",
                                "Real-time updates",
                                "24/7 Support"
                            ].map((item, i) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span className="text-lg font-medium">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <motion.div
                    className="relative z-10 text-sm opacity-70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 0.8 }}
                >
                    © 2026 Progress Inc.
                </motion.div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-gradient-to-br from-gray-50 to-white">
                <Link to="/" className="absolute top-6 left-6 lg:hidden flex items-center gap-2 text-primary">
                    <Handshake className="w-6 h-6" />
                    <span className="font-bold">Progress</span>
                </Link>

                <motion.div
                    className="w-full max-w-sm space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Sign In</h2>
                        <p className="text-muted-foreground mt-3 text-base">
                            Enter your email and password to access your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                        {/* Email Field with Floating Label */}
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <div className="relative">
                                <Mail className={cn(
                                    "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-200",
                                    emailFocused || emailValue ? "text-primary" : "text-muted-foreground"
                                )} />
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    {...register("email")}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    className={cn(
                                        "pl-10 h-14 text-base transition-all duration-300 border-2",
                                        emailFocused && "ring-4 ring-primary/10 border-primary shadow-lg shadow-primary/5",
                                        errors.email && "border-red-500 bg-red-50/10 focus:ring-red-500/10"
                                    )}
                                    autoFocus
                                />
                                <Label
                                    htmlFor="email"
                                    className={cn(
                                        "absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1",
                                        emailFocused || emailValue
                                            ? "-top-2.5 text-xs text-primary font-medium"
                                            : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                                    )}
                                >
                                    Email
                                </Label>
                            </div>
                            {errors.email && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-500 font-medium ml-1 flex items-center gap-1"
                                >
                                    {errors.email.message}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Password Field with Floating Label */}
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Password</span>
                                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline transition-all hover:text-primary/80">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className={cn(
                                    "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-200",
                                    passwordFocused || passwordValue ? "text-primary" : "text-muted-foreground"
                                )} />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    {...register("password")}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    className={cn(
                                        "pl-10 pr-10 h-14 text-base transition-all duration-300 border-2",
                                        passwordFocused && "ring-4 ring-primary/10 border-primary shadow-lg shadow-primary/5",
                                        errors.password && "border-red-500 bg-red-50/10 focus:ring-red-500/10"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-500 font-medium ml-1"
                                >
                                    {errors.password.message}
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div
                            className="flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                Remember me for 30 days
                            </label>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Button
                                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02]"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <motion.div
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        />
                                        Signing in...
                                    </span>
                                ) : (
                                    <>
                                        Sign In <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    <motion.p
                        className="text-center text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        Don't have an account?{" "}
                        <Link to="/get-started" className="text-primary hover:underline font-semibold transition-all hover:text-primary/80">
                            Create an account
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}

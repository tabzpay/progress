import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Handshake, ArrowRight, Check, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { motion } from "motion/react";

import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "", general: "" });

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({ email: "", password: "", general: "" });

        // Validation
        let hasError = false;
        if (!email) {
            setErrors(prev => ({ ...prev, email: "Email is required" }));
            hasError = true;
        } else if (!validateEmail(email)) {
            setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
            hasError = true;
        }

        if (!password) {
            setErrors(prev => ({ ...prev, password: "Password is required" }));
            hasError = true;
        }

        if (hasError) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                toast.success("Welcome back!");
                navigate("/dashboard");
            }
        } catch (error: any) {
            console.error("Login error:", error);

            let message = "Invalid email or password";
            if (error.message?.includes("Email not confirmed")) {
                message = "Please check your inbox to confirm your email address before signing in.";
            } else if (error.message) {
                message = error.message;
            }

            setErrors(prev => ({ ...prev, general: message }));
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex overflow-hidden">
            {/* Left Panel - Marketing (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary text-primary-foreground p-12 flex-col justify-between overflow-hidden">
                {/* Decorative Background */}
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
                            Welcome back.
                        </h1>
                        <p className="text-lg text-primary-foreground/90 leading-relaxed mb-8">
                            Sign in to manage your loans, check repayment status, and keep your finances on track.
                        </p>

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
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="bg-white/20 p-1 rounded-full">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span>{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm opacity-60">
                    © 2026 Progress Inc.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
                <Link to="/" className="absolute top-6 left-6 lg:hidden flex items-center gap-2 text-primary">
                    <Handshake className="w-6 h-6" />
                    <span className="font-bold">Progress</span>
                </Link>

                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
                        <p className="text-muted-foreground mt-2">
                            Enter your email and password to access your account.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    className={`pl-10 h-12 ${errors.email ? 'border-red-500' : ''}`}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors(prev => ({ ...prev, email: "" }));
                                    }}
                                    autoFocus
                                />
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    className={`pl-10 pr-10 h-12 ${errors.password ? 'border-red-500' : ''}`}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
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
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground cursor-pointer">
                                Remember me for 30 days
                            </label>
                        </div>

                        <Button className="w-full h-12 text-base" type="submit" disabled={isLoading}>
                            {isLoading ? "Signing in..." : (
                                <>
                                    Sign In <ArrowRight className="ml-2 w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link to="/get-started" className="text-primary hover:underline font-medium">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

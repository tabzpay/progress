import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Handshake, Eye, EyeOff, ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";
import { logActivity } from "../../lib/logger";

const ResetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof ResetPasswordSchema>;

export function ResetPassword() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [hasSession, setHasSession] = useState(false);

    // Supabase puts the recovery token in the URL hash, which it picks up automatically.
    // We just need to confirm a session exists before showing the form.
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setHasSession(true);
            } else {
                // No session — the link may have expired or already been used.
                toast.error("This reset link has expired. Please request a new one.");
                navigate("/forgot-password");
            }
        });
    }, [navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetFormData>({
        resolver: zodResolver(ResetPasswordSchema),
    });

    const onSubmit = async (data: ResetFormData) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (error) throw error;

            await logActivity("PASSWORD_RESET", "User successfully reset their password via email link");
            setIsSuccess(true);
            toast.success("Password updated! Redirecting to sign in…");
            setTimeout(() => navigate("/sign-in"), 2500);
        } catch (error: any) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasSession) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white relative lg:flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white p-12 flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-blue-500/20 to-purple-600/20 z-0" />
                <motion.div
                    className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px]"
                    animate={{ x: [50, -50, 50], y: [-50, 50, -50], scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-[100px]"
                    animate={{ x: [-30, 30, -30], y: [30, -30, 30] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-white mb-12 hover:opacity-80 transition-opacity">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Handshake className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Progress</span>
                    </Link>

                    <div className="max-w-md">
                        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                            Create a new password.
                        </h1>
                        <p className="text-lg text-white/90 leading-relaxed mb-8">
                            Choose a strong password to keep your account secure. You won't need to do this again.
                        </p>

                        {[
                            "At least 8 characters",
                            "One uppercase letter",
                            "One number",
                        ].map((tip, i) => (
                            <motion.div
                                key={tip}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="flex items-center gap-3 mb-3"
                            >
                                <div className="bg-white/20 p-1 rounded-full">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <span>{tip}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-sm opacity-60">© 2026 Progress Inc.</div>
            </div>

            {/* Right Panel — Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-gradient-to-br from-gray-50 to-white">
                <Link to="/" className="absolute top-6 left-6 lg:hidden flex items-center gap-2 text-indigo-600">
                    <Handshake className="w-6 h-6" />
                    <span className="font-bold">Progress</span>
                </Link>

                <motion.div
                    className="w-full max-w-sm space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {!isSuccess ? (
                        <>
                            <div className="text-center lg:text-left">
                                <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    New Password
                                </h2>
                                <p className="text-muted-foreground mt-3 text-base">
                                    Enter and confirm your new password below.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            placeholder="Min. 8 characters"
                                            {...register("password")}
                                            className={cn(
                                                "pl-10 pr-10 h-14 text-base border-2",
                                                errors.password && "border-red-500"
                                            )}
                                            autoFocus
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
                                        <p className="text-sm text-red-500 font-medium ml-1">{errors.password.message}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            autoComplete="new-password"
                                            placeholder="Re-enter password"
                                            {...register("confirmPassword")}
                                            className={cn(
                                                "pl-10 pr-10 h-14 text-base border-2",
                                                errors.confirmPassword && "border-red-500"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-red-500 font-medium ml-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02]"
                                >
                                    {isLoading ? "Updating…" : (
                                        <>Update Password <ArrowRight className="ml-2 w-5 h-5" /></>
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-10 h-10 text-emerald-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Password Updated!</h2>
                                <p className="text-muted-foreground">Redirecting you to sign in…</p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

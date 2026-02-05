import { useState } from "react";
import { Link } from "react-router-dom";
import { Handshake, ArrowRight, ArrowLeft, Mail, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { motion } from "motion/react";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background flex overflow-hidden">
            {/* Left Panel - Marketing */}
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
                            Don't worry, it happens.
                        </h1>
                        <p className="text-lg text-primary-foreground/90 leading-relaxed mb-8">
                            We'll send you a password reset link to get you back into your account quickly and securely.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Check your email inbox",
                                "Click the reset link",
                                "Create a new password"
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
                    {!isSubmitted ? (
                        <>
                            <div className="text-center lg:text-left">
                                <Link
                                    to="/sign-in"
                                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Sign In
                                </Link>
                                <h2 className="text-3xl font-bold tracking-tight">Reset your password</h2>
                                <p className="text-muted-foreground mt-2">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="name@example.com"
                                            className={`pl-10 h-12 ${error ? 'border-red-500' : ''}`}
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError("");
                                            }}
                                            autoFocus
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-500">{error}</p>}
                                </div>

                                <Button
                                    className="w-full h-12 text-base"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Sending..." : (
                                        <>
                                            Send Reset Link <ArrowRight className="ml-2 w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <p className="text-center text-sm text-muted-foreground">
                                Remember your password?{" "}
                                <Link to="/sign-in" className="text-primary hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Check your email</h2>
                                <p className="text-muted-foreground">
                                    We've sent a password reset link to
                                </p>
                                <p className="font-medium text-foreground">{email}</p>
                            </div>

                            <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-left">
                                <p className="font-medium mb-2">Didn't receive the email?</p>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Check your spam/junk folder</li>
                                    <li>• Make sure {email} is correct</li>
                                    <li>• Wait a few minutes and check again</li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        setEmail("");
                                    }}
                                    className="w-full"
                                >
                                    Try another email
                                </Button>
                                <Link to="/sign-in" className="w-full">
                                    <Button variant="ghost" className="w-full">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

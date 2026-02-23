import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function MFAVerify() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("");

    const factorId = location.state?.factorId;

    if (!factorId) {
        navigate("/sign-in");
        return null;
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId
            });

            if (challengeError) throw challengeError;

            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code
            });

            if (verifyError) throw verifyError;

            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Invalid verification code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Premium Header */}
            <header className="relative overflow-hidden pt-8 pb-32 px-4 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-[60px]"
                    />
                </div>
                <div className="max-w-xl mx-auto relative z-10 text-white">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/sign-in")}
                            className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Two-Factor Auth</h1>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-1">Identity verification</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Card */}
            <main className="max-w-xl mx-auto px-4 -mt-16 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100"
                >
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Shield className="w-8 h-8" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-slate-900">Enter your code</h2>
                            <p className="text-sm text-slate-500">
                                Enter the 6-digit code from your authenticator app to continue.
                            </p>
                        </div>

                        <form onSubmit={handleVerify} className="w-full space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Verification Code</Label>
                                <Input
                                    placeholder="000000"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="h-16 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 text-center text-2xl font-bold tracking-[0.5em]"
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || code.length < 6}
                                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg shadow-slate-100"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
                            </Button>
                        </form>

                        <Button
                            variant="ghost"
                            onClick={() => navigate("/sign-in")}
                            className="text-slate-500 font-bold flex items-center gap-2 hover:bg-slate-100 rounded-xl"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </Button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

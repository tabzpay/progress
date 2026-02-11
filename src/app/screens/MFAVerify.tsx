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
        navigate("/signin");
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100"
            >
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Shield className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-slate-900">Two-Factor Authentication</h1>
                        <p className="text-sm text-slate-500">
                            Enter the 6-digit verification code from your authenticator app to continue.
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
                        onClick={() => navigate("/signin")}
                        className="text-slate-500 font-bold flex items-center gap-2 hover:bg-slate-100 rounded-xl"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sign In
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

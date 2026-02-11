import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Shield, ArrowLeft, Loader2, CheckCircle2, QrCode, AlertCircle, Trash2, KeyRound, Lock, Unlock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { deriveKey } from "../../lib/encryption";
import { setPrivacyKey, getPrivacyStatus } from "../../lib/privacyKeyStore";
import { logActivity } from "../../lib/logger";
import { ConfirmModal } from "../components/ConfirmModal";

export default function SecuritySettings() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [mfaFactors, setMfaFactors] = useState<any[]>([]);
    const [enrollmentData, setEnrollmentData] = useState<any>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [showEnrollment, setShowEnrollment] = useState(false);

    // Privacy Key State
    const [passphrase, setPassphrase] = useState("");
    const [isPrivacyUnlocked, setIsPrivacyUnlocked] = useState(getPrivacyStatus() === 'unlocked');
    const [showUnenrollModal, setShowUnenrollModal] = useState(false);
    const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);

    useEffect(() => {
        fetchMFAList();
    }, []);

    async function fetchMFAList() {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) {
            console.error("Error fetching MFA factors:", error);
        } else {
            setMfaFactors(data.all || []);
        }
    }

    const handleEnroll = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
                issuer: 'Progress'
            });

            if (error) throw error;
            setEnrollmentData(data);
            setShowEnrollment(true);
        } catch (error: any) {
            toast.error(error.message || "Failed to start MFA enrollment");
        } finally {
            setLoading(false);
        }
    };

    const verifyAndEnable = async () => {
        if (!enrollmentData) return;
        setLoading(true);
        try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: enrollmentData.id
            });

            if (challengeError) throw challengeError;

            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId: enrollmentData.id,
                challengeId: challengeData.id,
                code: verificationCode
            });

            if (verifyError) throw verifyError;

            toast.success("2FA enabled successfully!");
            await logActivity('MFA_ENABLED', 'User successfully enrolled and verified a TOTP factor');
            setShowEnrollment(false);
            setEnrollmentData(null);
            setVerificationCode("");
            fetchMFAList();
        } catch (error: any) {
            toast.error(error.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const unenrollFactor = async () => {
        if (!pendingFactorId) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.mfa.unenroll({
                factorId: pendingFactorId
            });

            if (error) throw error;
            await logActivity('MFA_DISABLED', 'User disabled Two-Factor Authentication');
            toast.success("2FA disabled successfully.");
            fetchMFAList();
            setShowUnenrollModal(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to disable 2FA");
        } finally {
            setLoading(false);
            setPendingFactorId(null);
        }
    };

    const handlePrivacyUnlock = async () => {
        if (!passphrase) return;
        setLoading(true);
        try {
            const key = await deriveKey(passphrase);
            setPrivacyKey(key);
            setIsPrivacyUnlocked(true);
            setPassphrase("");
            await logActivity('PRIVACY_SHIELD_UNLOCKED', 'User unlocked the privacy shield with their passphrase');
            toast.success("Privacy Shield Unlocked! Your data will now be encrypted/decrypted locally.");
        } catch (error: any) {
            toast.error("Failed to unlock privacy shield");
        } finally {
            setLoading(false);
        }
    };

    const handlePrivacyWipe = () => {
        setPrivacyKey(null);
        setIsPrivacyUnlocked(false);
        logActivity('PRIVACY_SHIELD_LOCKED', 'User locked the privacy shield, wiping the key from memory');
        toast.info("Privacy Shield Locked. Local key wiped from memory.");
    };

    const activeFactor = mfaFactors.find(f => f.status === 'verified');

    return (
        <div className="min-h-screen bg-[#FAFBFF] pb-20">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <h1 className="text-lg font-bold text-slate-900">Security Center</h1>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 py-8 space-y-8">
                {/* Security Hero */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-colors ${activeFactor ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                        <Shield className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Account Security</h2>
                        <p className="text-slate-500 text-sm mt-1">
                            {activeFactor
                                ? "Your account is protected by Two-Factor Authentication."
                                : "Add an extra layer of security to your account with 2FA."}
                        </p>
                    </div>
                </div>

                {/* 2FA Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Multi-Factor Authentication</Label>
                    </div>

                    {!activeFactor ? (
                        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                            <div className="p-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                        <QrCode className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Authenticator App (TOTP)</h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            Use an app like Google Authenticator or Authy to generate secure, timed codes.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleEnroll}
                                    disabled={loading}
                                    className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 font-bold"
                                >
                                    {loading && !showEnrollment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Set up 2FA"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-50/50 rounded-3xl border border-emerald-100 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">2FA is Enabled</h3>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Device: {activeFactor.friendly_name || 'Primary'}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setPendingFactorId(activeFactor.id); setShowUnenrollModal(true); }}
                                disabled={loading}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </section>

                {/* Enrollment Modal/Overlay */}
                <AnimatePresence>
                    {showEnrollment && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8">
                                    <div className="text-center space-y-2 mb-8">
                                        <h3 className="text-xl font-bold text-slate-900">Setup Authenticator</h3>
                                        <p className="text-sm text-slate-500">Scan this QR code with your app</p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-3xl flex flex-col items-center justify-center mb-8 border border-slate-100">
                                        {/* QR Code Placeholder - Using an API for generating QR code since local install failed */}
                                        {enrollmentData?.totp?.qr_code ? (
                                            <img
                                                src={enrollmentData.totp.qr_code}
                                                alt="MFA QR Code"
                                                className="w-48 h-48 bg-white p-2 rounded-xl shadow-inner"
                                            />
                                        ) : (
                                            <div className="w-48 h-48 bg-white animate-pulse rounded-xl" />
                                        )}
                                        <div className="mt-4 p-3 bg-white rounded-xl border border-slate-100 flex flex-col items-center gap-1 w-full max-w-[200px]">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secret Key</span>
                                            <code className="text-[11px] font-mono text-slate-900 break-all text-center">{enrollmentData?.totp?.secret}</code>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-1">Verification Code</Label>
                                            <Input
                                                placeholder="Enter 6-digit code"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 text-center text-xl font-bold tracking-[0.5em]"
                                                maxLength={6}
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                variant="ghost"
                                                onClick={() => { setShowEnrollment(false); setEnrollmentData(null); }}
                                                className="flex-1 rounded-2xl h-12 font-bold text-slate-500"
                                                disabled={loading}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={verifyAndEnable}
                                                className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 font-bold shadow-lg shadow-slate-200"
                                                disabled={loading || verificationCode.length < 6}
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Enable"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Privacy Shield Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Privacy Shield (Zero-Knowledge)</Label>
                    </div>

                    <div className={`bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isPrivacyUnlocked ? 'border-emerald-100 shadow-lg shadow-emerald-500/5' : 'border-slate-100 shadow-sm'}`}>
                        <div className="p-8">
                            <div className="flex gap-5 items-start">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isPrivacyUnlocked ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {isPrivacyUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900">End-to-End Encryption</h3>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        Set a privacy key to encrypt sensitive details. Data is encrypted on your device and can never be read by anyone else, including us.
                                    </p>
                                </div>
                            </div>

                            {!isPrivacyUnlocked ? (
                                <div className="mt-8 space-y-4">
                                    <div className="relative group">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="Enter your privacy passphrase"
                                            value={passphrase}
                                            onChange={(e) => setPassphrase(e.target.value)}
                                            className="h-14 rounded-2xl bg-slate-50 border-transparent pl-12 focus:bg-white focus:border-indigo-100 transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <Button
                                        onClick={handlePrivacyUnlock}
                                        disabled={loading || !passphrase}
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Unlock Privacy Shield"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="mt-8 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        <span className="text-sm font-bold text-emerald-700">Shield is Active</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handlePrivacyWipe}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        Lock & Wipe Key
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="font-bold text-amber-900 text-sm">Security Best Practices</h4>
                        <p className="text-xs text-amber-800 leading-relaxed opacity-80">
                            Never share your authentication codes or secret keys with anyone. Progress support will never ask for them.
                        </p>
                    </div>
                </section>
            </main>

            <ConfirmModal
                isOpen={showUnenrollModal}
                onOpenChange={setShowUnenrollModal}
                onConfirm={unenrollFactor}
                title="Disable 2FA?"
                description="Are you sure you want to disable Two-Factor Authentication? This will significantly decrease your account security."
                confirmText="Disable 2FA"
                variant="danger"
                icon={Shield}
            />
        </div>
    );
}

import { ShieldCheck, Mail, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../ui/utils";
import { VerificationStatus } from "../../../../lib/verification";

interface VerificationPromptProps {
    status: VerificationStatus;
    onResendEmail?: () => void;
    onVerifyPhone?: () => void;
}

export function VerificationPrompt({ status, onResendEmail, onVerifyPhone }: VerificationPromptProps) {
    const { isVerified, emailVerified, phoneVerified } = status;

    // Don't show if already verified
    if (isVerified) {
        return null;
    }

    const progress = [emailVerified, phoneVerified].filter(Boolean).length;
    const total = 2;
    const progressPercent = (progress / total) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 shadow-sm"
        >
            <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        Become a Verified Member
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 font-medium">
                        Complete {total - progress} more step{total - progress !== 1 ? 's' : ''} to earn your verification badge
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Progress
                    </span>
                    <span className="text-xs font-bold text-indigo-600">
                        {progress}/{total} completed
                    </span>
                </div>
                <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    />
                </div>
            </div>

            {/* Verification Steps */}
            <div className="space-y-3">
                {/* Email Verification */}
                <div
                    className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                        emailVerified
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-white border-slate-200"
                    )}
                >
                    <div
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            emailVerified
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 text-slate-400"
                        )}
                    >
                        {emailVerified ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <Mail className="w-5 h-5" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">
                            Email Verification
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {emailVerified
                                ? "Your email is verified"
                                : "Check your inbox for confirmation link"}
                        </div>
                    </div>
                    {!emailVerified && onResendEmail && (
                        <button
                            onClick={onResendEmail}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
                        >
                            Resend
                        </button>
                    )}
                </div>

                {/* Phone Verification */}
                <div
                    className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                        phoneVerified
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-white border-slate-200"
                    )}
                >
                    <div
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            phoneVerified
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 text-slate-400"
                        )}
                    >
                        {phoneVerified ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <Smartphone className="w-5 h-5" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">
                            Phone Verification
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {phoneVerified
                                ? "Your phone is verified"
                                : "Verify your phone number"}
                        </div>
                    </div>
                    {!phoneVerified && onVerifyPhone && (
                        <button
                            onClick={onVerifyPhone}
                            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2 rounded-lg shadow-sm"
                        >
                            Verify
                        </button>
                    )}
                </div>
            </div>

            {/* Info Note */}
            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 font-medium leading-relaxed">
                    Verified members get enhanced trust and access to premium features
                </p>
            </div>
        </motion.div>
    );
}

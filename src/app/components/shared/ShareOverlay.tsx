import { motion, AnimatePresence } from "motion/react";
import { Copy, Share2, Check, X, QrCode } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "../ui/utils";

interface ShareOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    shareUrl: string;
    recipientName: string;
}

export function ShareOverlay({
    isOpen,
    onClose,
    title,
    shareUrl,
    recipientName
}: ShareOverlayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Loan Agreement Invitation",
                text: `Hi ${recipientName}, please review and accept the loan agreement here:`,
                url: shareUrl,
            }).catch(() => {
                // Fallback to copy if share is cancelled or fails
                handleCopy();
            });
        } else {
            handleCopy();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Share2 className="w-10 h-10" />
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 mb-2">{title}</h2>
                            <p className="text-sm font-medium text-slate-500 mb-8 px-4">
                                Share this secure link with <span className="text-slate-900 font-bold">{recipientName}</span> to finalize the agreement.
                            </p>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8 relative group">
                                <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 text-left">Invitation Link</div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 text-xs font-mono text-slate-600 truncate text-left">
                                        {shareUrl.replace('https://', '')}
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className={cn(
                                            "p-2 rounded-lg transition-all active:scale-95",
                                            copied ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-400 hover:text-indigo-600"
                                        )}
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={handleNativeShare}
                                    className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group"
                                >
                                    <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    Share Invitation
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="w-full h-12 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600"
                                    onClick={onClose}
                                >
                                    Close Window
                                </Button>
                            </div>
                        </div>

                        {/* QR Decoration (Visual only) */}
                        <div className="absolute -bottom-4 -left-4 opacity-[0.03] rotate-12">
                            <QrCode className="w-32 h-32" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

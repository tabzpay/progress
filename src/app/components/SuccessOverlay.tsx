import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight, Zap, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface SuccessOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    details?: { label: string; value: string }[];
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    type?: "success" | "info" | "emerald";
}

export function SuccessOverlay({
    isOpen,
    onClose,
    title,
    message,
    details,
    actionLabel = "Continue",
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    type = "success"
}: SuccessOverlayProps) {
    const isEmerald = type === "emerald";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-sm bg-white rounded-[3rem] p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Animated background element */}
                        <div className={cn(
                            "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-20",
                            isEmerald ? "bg-emerald-500" : "bg-indigo-500"
                        )} />

                        <div className="relative z-10 text-center">
                            {/* Animated Icon Container */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className={cn(
                                    "w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl",
                                    isEmerald
                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                        : "bg-indigo-600 text-white shadow-indigo-600/20"
                                )}
                            >
                                <div className="relative">
                                    <Check className="w-12 h-12 stroke-[3]" />
                                    <motion.div
                                        animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-white/30 rounded-full blur-md"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{title}</h2>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
                                    {message}
                                </p>
                            </motion.div>

                            {details && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-slate-50 rounded-[2rem] p-6 mb-8 space-y-4"
                                >
                                    {details.map((detail, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{detail.label}</span>
                                            <span className="text-sm font-bold text-slate-800">{detail.value}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Button
                                    onClick={onAction || onClose}
                                    className={cn(
                                        "w-full h-16 rounded-2xl text-lg font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group",
                                        isEmerald
                                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                                            : "bg-indigo-600 hover:bg-blue-600 text-white shadow-indigo-600/20"
                                    )}
                                >
                                    {actionLabel}
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Button>

                                {onSecondaryAction && (
                                    <Button
                                        variant="outline"
                                        onClick={onSecondaryAction}
                                        className="w-full h-16 rounded-2xl text-lg font-bold border-slate-200 mt-3 transition-all active:scale-95"
                                    >
                                        {secondaryActionLabel}
                                    </Button>
                                )}

                                {!onAction && (
                                    <button
                                        onClick={onClose}
                                        className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                    >
                                        Close Window
                                    </button>
                                )}
                            </motion.div>
                        </div>

                        {/* Sprinkles Decor */}
                        <div className="absolute top-4 left-4 opacity-10">
                            <Sparkles className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div className="absolute bottom-4 right-4 opacity-10">
                            <Zap className="w-6 h-6 text-amber-500" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface WelcomeTooltipProps {
    isVisible: boolean;
    onDismiss: () => void;
    anchorId?: string;
    message?: string;
    title?: string;
}

export function WelcomeTooltip({
    isVisible,
    onDismiss,
    title = "Welcome to Progress!",
    message = "Let's track your first lending record to get started with your journey to clarity."
}: WelcomeTooltipProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-6 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                        className="pointer-events-auto relative w-full max-w-sm bg-slate-900 text-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/10"
                    >
                        {/* Glow effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full -z-10" />

                        <div className="p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 shadow-inner">
                                    <Sparkles className="w-5 h-5 text-blue-400" />
                                </div>
                                <button
                                    onClick={onDismiss}
                                    className="text-white/40 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 mb-8">
                                <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            <Button
                                onClick={onDismiss}
                                className="w-full h-11 bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl transition-all shadow-xl shadow-blue-500/10 group"
                            >
                                Get Started
                                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </Button>
                        </div>

                        {/* Animated progress-like bar at the bottom */}
                        <div className="h-1 w-full bg-white/5 overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                onAnimationComplete={onDismiss}
                                className="h-full bg-blue-400/60"
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

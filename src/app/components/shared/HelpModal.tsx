import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Keyboard, X } from "lucide-react";
import { cn } from "../ui/utils";

interface Shortcut {
    keys: string[];
    description: string;
    category: string;
}

export function HelpModal() {
    const [isOpen, setIsOpen] = useState(false);

    const shortcuts: Shortcut[] = [
        { keys: ["Cmd", "K"], description: "Open command palette", category: "Navigation" },
        { keys: ["Cmd", "N"], description: "Create new loan", category: "Actions" },
        { keys: ["Cmd", "D"], description: "Go to dashboard", category: "Navigation" },
        { keys: ["Cmd", "G"], description: "Go to groups", category: "Navigation" },
        { keys: ["?"], description: "Show keyboard shortcuts", category: "Help" },
        { keys: ["Esc"], description: "Close modals/dialogs", category: "General" },
        { keys: ["/"], description: "Focus search (where available)", category: "General" },
    ];

    const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener("openHelpModal", handleOpen);
        return () => window.removeEventListener("openHelpModal", handleOpen);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                                <Keyboard className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
                                <p className="text-sm text-slate-500">Speed up your workflow</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Shortcuts List */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {categories.map((category) => (
                            <div key={category} className="mb-6 last:mb-0">
                                <h3 className="text-xs uppercase font-black tracking-widest text-slate-400 mb-3">
                                    {category}
                                </h3>
                                <div className="space-y-2">
                                    {shortcuts
                                        .filter((s) => s.category === category)
                                        .map((shortcut, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                            >
                                                <span className="text-slate-700 font-medium">{shortcut.description}</span>
                                                <div className="flex items-center gap-1">
                                                    {shortcut.keys.map((key, i) => (
                                                        <span key={i} className="flex items-center gap-1">
                                                            {i > 0 && <span className="text-slate-400">+</span>}
                                                            <kbd className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg border-2 border-slate-200 font-bold text-sm min-w-[2.5rem] text-center">
                                                                {key}
                                                            </kbd>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
                        <p className="text-xs font-bold text-slate-500">
                            Press{" "}
                            <kbd className="px-2 py-1 bg-white rounded border border-slate-300 mx-1">Esc</kbd> to
                            close
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

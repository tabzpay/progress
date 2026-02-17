import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
    Home,
    Plus,
    Users,
    User,
    FileText,
    DollarSign,
    Search,
    X,
} from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";

interface Command {
    id: string;
    label: string;
    description?: string;
    icon: any;
    action: () => void;
    keywords?: string[];
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    const commands: Command[] = [
        {
            id: "dashboard",
            label: "Go to Dashboard",
            description: "View your loan overview",
            icon: Home,
            action: () => {
                navigate("/dashboard");
                setIsOpen(false);
            },
            keywords: ["home", "overview", "main"],
        },
        {
            id: "create-loan",
            label: "Create New Loan",
            description: "Start a new loan record",
            icon: Plus,
            action: () => {
                navigate("/create-loan");
                setIsOpen(false);
            },
            keywords: ["new", "add", "record"],
        },
        {
            id: "groups",
            label: "View Groups",
            description: "Manage your loan groups",
            icon: Users,
            action: () => {
                navigate("/groups");
                setIsOpen(false);
            },
            keywords: ["team", "members"],
        },
        {
            id: "profile",
            label: "Profile Settings",
            description: "Update your account",
            icon: User,
            action: () => {
                navigate("/profile");
                setIsOpen(false);
            },
            keywords: ["account", "settings", "preferences"],
        },
        {
            id: "loans",
            label: "All Loans",
            description: "View all loan records",
            icon: DollarSign,
            action: () => {
                navigate("/loans");
                setIsOpen(false);
            },
            keywords: ["records", "list"],
        },
    ];

    const filteredCommands = search
        ? commands.filter((cmd) => {
            const searchLower = search.toLowerCase();
            return (
                cmd.label.toLowerCase().includes(searchLower) ||
                cmd.description?.toLowerCase().includes(searchLower) ||
                cmd.keywords?.some((k) => k.includes(searchLower))
            );
        })
        : commands;

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            setSearch("");
            setSelectedIndex(0);
        };

        window.addEventListener("openCommandPalette", handleOpen);
        return () => window.removeEventListener("openCommandPalette", handleOpen);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((i) => (i + 1) % filteredCommands.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Search Header */}
                    <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                        <Search className="w-5 h-5 text-slate-400 shrink-0" />
                        <Input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Type a command or search..."
                            className="border-0 focus-visible:ring-0 text-lg font-medium"
                        />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="shrink-0 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Commands List */}
                    <div className="max-h-[400px] overflow-y-auto p-2">
                        {filteredCommands.length > 0 ? (
                            <div className="space-y-1">
                                {filteredCommands.map((cmd, idx) => (
                                    <button
                                        key={cmd.id}
                                        onClick={cmd.action}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group",
                                            idx === selectedIndex
                                                ? "bg-indigo-50 border-2 border-indigo-200"
                                                : "hover:bg-slate-50 border-2 border-transparent"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                idx === selectedIndex
                                                    ? "bg-indigo-100 text-indigo-600"
                                                    : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                                            )}
                                        >
                                            <cmd.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900">{cmd.label}</div>
                                            {cmd.description && (
                                                <div className="text-xs text-slate-500 mt-0.5">{cmd.description}</div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-400">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-bold">No commands found</p>
                                <p className="text-sm">Try a different search term</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-2 py-1 bg-white rounded border border-slate-300">↑↓</kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-2 py-1 bg-white rounded border border-slate-300">↵</kbd>
                                Select
                            </span>
                        </div>
                        <span className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-white rounded border border-slate-300">Esc</kbd>
                            Close
                        </span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

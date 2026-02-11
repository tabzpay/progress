import { ArrowLeft, HelpCircle, BookOpen, BarChart3, Star, FileText, ShieldAlert, Info, ChevronRight, MessageSquare, Newspaper, Zap, Clock, BellRing, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";

export function MoreUtilities() {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const utilityGroups = [
        {
            title: "Automation & Security",
            items: [
                {
                    icon: BellRing,
                    label: "Auto-Reminders",
                    desc: "Scheduled payment alerts",
                    path: "/reminder-settings",
                    color: "bg-indigo-50 text-indigo-600"
                },
                {
                    icon: Shield,
                    label: "Security Center",
                    desc: "2FA & Account protection",
                    path: "/security-settings",
                    color: "bg-emerald-50 text-emerald-600"
                },
                { icon: Zap, label: "Boost Score", desc: "Improve your credit rating", color: "bg-indigo-50 text-indigo-600", path: "/dashboard" },
            ]
        },
        {
            title: "Insights & Stories",
            items: [
                { icon: Clock, label: "Activity History", desc: "Full log of all communications", color: "bg-indigo-50 text-indigo-600", path: "/activity-log" },
                { icon: Star, label: "Success Stories", desc: "How others use Progress", color: "bg-violet-50 text-violet-600", path: "/stories" },
            ]
        },
        {
            title: "App Community",
            items: [
                { icon: Newspaper, label: "Our Blog", desc: "Latest news and tips", color: "bg-indigo-50 text-indigo-600", path: "/blog" },
                { icon: Info, label: "About Progress", desc: "Version 1.2.0 Build 2026", color: "bg-slate-50 text-slate-600", path: "/about" },
            ]
        },
        {
            title: "Legal & Security",
            items: [
                { icon: ShieldAlert, label: "Privacy Policy", desc: "Your data protection", color: "bg-rose-50 text-rose-600", path: "/privacy" },
                { icon: FileText, label: "Terms of Service", desc: "Usage agreements", color: "bg-slate-50 text-slate-600", path: "/terms" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32">
            {/* Premium Header */}
            <header className="relative overflow-hidden pt-8 pb-12 px-4 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-[60px]"
                    />
                </div>

                <div className="max-w-xl mx-auto relative z-10 text-white">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0"
                            onClick={() => navigate("/dashboard")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Utilities</h1>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-1">
                                Discover more features
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-xl mx-auto px-4 -mt-6 relative z-20">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-8"
                >
                    {utilityGroups.map((group, gIdx) => (
                        <motion.div key={gIdx} variants={itemVariants} className="space-y-3">
                            <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 ml-4">{group.title}</h3>
                            <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
                                {group.items.map((item, iIdx) => (
                                    <button
                                        key={iIdx}
                                        onClick={() => navigate(item.path)}
                                        className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 transition-all text-left border-b border-slate-100 last:border-0 group"
                                    >
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90 shadow-sm", item.color)}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[15px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.label}</div>
                                            <div className="text-xs font-medium text-slate-400 mt-0.5">{item.desc}</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ))}

                    {/* Featured Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-indigo-600/20"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xl font-black mb-2">Build a Credit History</h4>
                            <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-[240px]">
                                Did you know Progress can help you build your informal credit score?
                            </p>
                            <Button className="mt-6 bg-white text-indigo-600 hover:bg-white/90 rounded-xl font-bold">
                                Learn How
                            </Button>
                        </div>
                    </motion.div>

                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pt-4">
                        Progress v1.2.0 • Made for Impact
                    </p>
                </motion.div>
            </main>
        </div>
    );
}

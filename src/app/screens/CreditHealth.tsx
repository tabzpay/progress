import { useState, useEffect } from "react";
import { ArrowLeft, Zap, TrendingUp, Info, CheckCircle2, AlertCircle, ShieldCheck, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { useAuth } from "../../lib/contexts/AuthContext";
import { calculateCreditScore, CreditScoreResult, getTierColor, getTierDescription } from "../../lib/CreditScore";
import { SEO } from "../components/layout/SEO";
import { cn } from "../components/ui/utils";

export function CreditHealth() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [scoreData, setScoreData] = useState<CreditScoreResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchScore();
        }
    }, [user]);

    async function fetchScore() {
        try {
            const result = await calculateCreditScore(user?.id || null);
            setScoreData(result);
        } catch (error) {
            console.error("Error fetching credit score:", error);
        } finally {
            setIsLoading(false);
        }
    }

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const score = scoreData?.score || 0;
    const tier = scoreData?.tier || 'Bronze';
    const tierColor = getTierColor(tier);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32">
            <SEO title="Credit Health" description="Expert analysis of your lending performance and credit factors." />
            {/* Premium Header */}
            <header className="relative overflow-hidden pt-8 pb-32 px-4">
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
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0"
                            onClick={() => navigate("/more")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Credit Health</h1>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-1">
                                Performance Metrics
                            </p>
                        </div>
                    </div>

                    {/* Score Meter */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    className="text-white/10"
                                />
                                <motion.circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    strokeDasharray={552.9}
                                    initial={{ strokeDashoffset: 552.9 }}
                                    animate={{ strokeDashoffset: 552.9 - (552.9 * score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black tracking-tighter">{score}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Score</span>
                            </div>
                        </div>
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                            <Star className="w-4 h-4 fill-current text-amber-400" />
                            <span className="text-sm font-black uppercase tracking-widest">{tier} Tier</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-xl mx-auto px-4 -mt-12 relative z-20 space-y-6">
                {/* Factors Card */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5 border border-slate-100"
                >
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Performance Factors</h3>

                    <div className="space-y-8">
                        {[
                            { label: "On-Time Payments", value: scoreData?.factors.onTimePaymentRate || 0, weight: "40%", icon: ShieldCheck },
                            { label: "Loan Completion", value: scoreData?.factors.loanCompletionRate || 0, weight: "30%", icon: CheckCircle2 },
                            { label: "Lending Volume", value: scoreData?.factors.totalVolumeNormalized || 0, weight: "20%", icon: TrendingUp },
                            { label: "Relationship Age", value: scoreData?.factors.relationshipDuration || 0, weight: "10%", icon: Zap },
                        ].map((factor, idx) => (
                            <motion.div key={idx} variants={itemVariants} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                            <factor.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{factor.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-black text-slate-400 uppercase">Weight {factor.weight}</span>
                                        <span className="text-sm font-black text-slate-900">{factor.value}%</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${factor.value}%` }}
                                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                        className={cn(
                                            "h-full rounded-full bg-gradient-to-r",
                                            factor.value > 80 ? "from-emerald-400 to-emerald-500" :
                                                factor.value > 50 ? "from-indigo-400 to-indigo-500" :
                                                    "from-amber-400 to-amber-500"
                                        )}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Tips Card */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-indigo-600/20"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Info className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                            <AlertCircle className="w-6 h-6" />
                            How to improve?
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-sm font-medium text-indigo-50 leading-relaxed">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">1</div>
                                <span>Always settle repayments before the due date to maximize your "On-time" rating.</span>
                            </li>
                            <li className="flex gap-3 text-sm font-medium text-indigo-50 leading-relaxed">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">2</div>
                                <span>Maintain longer relationships by consistently using Progress for your informal lending.</span>
                            </li>
                            <li className="flex gap-3 text-sm font-medium text-indigo-50 leading-relaxed">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">3</div>
                                <span>Increasing your total lending volume (safely) helps you reach the Platinum tier faster.</span>
                            </li>
                        </ul>
                    </div>
                </motion.div>

                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pt-4">
                    Values based on informal ledger history
                </p>
            </main>
        </div>
    );
}

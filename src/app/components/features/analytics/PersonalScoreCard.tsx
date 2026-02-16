import { motion } from 'motion/react';
import { ScoreBadge } from './ScoreBadge';
import { getTierDescription, type CreditScoreResult } from '../../lib/CreditScore';
import { Sparkles, Info, ArrowUpRight } from 'lucide-react';
import { cn } from './ui/utils';

interface PersonalScoreCardProps {
    creditScore: CreditScoreResult;
    onDetail?: () => void;
    className?: string;
}

export function PersonalScoreCard({ creditScore, onDetail, className }: PersonalScoreCardProps) {
    const { score, tier, trend } = creditScore;

    // Calculate progress to next tier
    const nextTierThresholds = {
        Bronze: 50,
        Silver: 70,
        Gold: 85,
        Platinum: 100
    };

    const currentThreshold = tier === 'Platinum' ? 100 : nextTierThresholds[tier];
    const progressToNext = tier === 'Platinum' ? 100 : Math.min(100, (score / currentThreshold) * 100);

    const tips = {
        Bronze: "Pay off small loans on time to build your history.",
        Silver: "Maintain a set of consistent on-time payments.",
        Gold: "You're doing great! Keep your loan-to-income ratio low.",
        Platinum: "Excellent! You're in the highest tier."
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative overflow-hidden bg-white/10 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] p-6 md:p-8 shadow-2xl",
                className
            )}
        >
            {/* Background Decorative Element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="shrink-0 bg-white/5 dark:bg-black/20 p-4 rounded-[2rem] border border-white/10">
                    <ScoreBadge
                        score={score}
                        tier={tier}
                        trend={trend}
                        size="lg"
                        showLabel={false}
                    />
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Your Credit Health</span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                            {tier} Status
                        </h2>
                        <p className="text-sm font-medium text-white/70">
                            {getTierDescription(tier)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                            <span>Progress to next level</span>
                            <span>{Math.round(progressToNext)}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressToNext}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary to-violet-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/10">
                        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Pro Tip</p>
                            <p className="text-xs font-medium text-white/80 leading-relaxed">
                                {tips[tier]}
                            </p>
                        </div>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onDetail}
                    className="shrink-0 flex flex-col items-center justify-center gap-2 w-full md:w-24 h-full md:h-auto py-6 md:py-0 bg-white text-indigo-700 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20"
                >
                    <ArrowUpRight className="w-5 h-5" />
                    Detail
                </motion.button>
            </div>
        </motion.div>
    );
}

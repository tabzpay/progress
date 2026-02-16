import { motion } from 'motion/react';
import { getTierColor, type CreditTier } from '../../lib/CreditScore';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrendDirection } from '../../lib/CreditScore';

interface ScoreBadgeProps {
    score: number; // 0-100
    tier: CreditTier;
    trend?: TrendDirection;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const sizeConfig = {
    sm: { width: 80, strokeWidth: 6, fontSize: 'text-lg', iconSize: 14 },
    md: { width: 120, strokeWidth: 8, fontSize: 'text-2xl', iconSize: 18 },
    lg: { width: 160, strokeWidth: 10, fontSize: 'text-4xl', iconSize: 24 }
};

export function ScoreBadge({
    score,
    tier,
    trend = 'stable',
    size = 'md',
    showLabel = true
}: ScoreBadgeProps) {
    const config = sizeConfig[size];
    const radius = (config.width / 2) - (config.strokeWidth / 2) - 4;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const tierColor = getTierColor(tier);

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#94A3B8';

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: config.width, height: config.width }}>
                {/* Background circle */}
                <svg className="transform -rotate-90" width={config.width} height={config.width}>
                    <circle
                        cx={config.width / 2}
                        cy={config.width / 2}
                        r={radius}
                        stroke="#E2E8F0"
                        strokeWidth={config.strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={config.width / 2}
                        cy={config.width / 2}
                        r={radius}
                        stroke={tierColor}
                        strokeWidth={config.strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                </svg>

                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        className={`font-bold ${config.fontSize}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        {score}
                    </motion.div>
                    <div className="flex items-center gap-1 mt-1">
                        <TrendIcon size={config.iconSize} color={trendColor} />
                    </div>
                </div>
            </div>

            {/* Tier badge */}
            {showLabel && (
                <motion.div
                    className="px-4 py-1 rounded-full text-sm font-bold"
                    style={{
                        backgroundColor: `${tierColor}20`,
                        color: tierColor,
                        border: `2px solid ${tierColor}`
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    {tier}
                </motion.div>
            )}
        </div>
    );
}

/**
 * Compact version for cards
 */
export function ScoreBadgeCompact({ score, tier }: { score: number; tier: CreditTier }) {
    const tierColor = getTierColor(tier);

    return (
        <div className="flex items-center gap-2">
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                    backgroundColor: `${tierColor}20`,
                    color: tierColor,
                    border: `2px solid ${tierColor}`
                }}
            >
                {score}
            </div>
            <div className="text-xs font-semibold text-slate-600">{tier}</div>
        </div>
    );
}

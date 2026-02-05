import { User, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "./ui/utils";
import { motion } from "motion/react";

interface GroupMemberRowProps {
  name: string;
  balance: number;
  isPositive: boolean;
  className?: string;
}

export function GroupMemberRow({
  name,
  balance,
  isPositive,
  className,
}: GroupMemberRowProps) {
  const formatAmount = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(num));
  };

  // Generate a consistent color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-orange-100 text-orange-600",
      "bg-emerald-100 text-emerald-600",
      "bg-blue-100 text-blue-600",
      "bg-violet-100 text-violet-600",
      "bg-rose-100 text-rose-600",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "flex items-center justify-between p-4 bg-white shadow-sm border border-border/50 rounded-2xl group transition-all",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg", getAvatarColor(name))}>
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-tight text-foreground">{name}</div>
          <div className="flex items-center gap-1 mt-0.5">
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 text-rose-500" />
            ) : (
              <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
            )}
            <span className={cn(
              "text-[11px] font-semibold uppercase tracking-wider",
              isPositive ? "text-rose-600" : "text-emerald-600"
            )}>
              {isPositive ? "Owes group" : "Is owed"}
            </span>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "text-lg font-black tabular-nums tracking-tighter",
          isPositive ? "text-rose-600" : "text-emerald-600"
        )}
      >
        {isPositive ? "+" : "-"}{formatAmount(balance)}
      </div>
    </motion.div>
  );
}

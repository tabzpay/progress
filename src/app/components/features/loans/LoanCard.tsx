import { ArrowRight, Calendar, User, TrendingUp, TrendingDown } from "lucide-react";
import { StatusTag } from "./StatusTag";
import { cn } from "../../ui/utils";
import { motion } from "motion/react";
import { ScoreBadgeCompact } from "../analytics/ScoreBadge";
import type { CreditTier } from "../../../../lib/CreditScore";

type LoanStatus = "active" | "partial" | "completed" | "overdue";
type LoanType = "personal" | "business" | "group";

interface LoanCardProps {
  id: string;
  borrowerName: string;
  amount: number;
  remainingAmount: number;
  dueDate: string;
  status: LoanStatus;
  type: LoanType;
  currency?: string;
  isLender: boolean;
  onClick?: () => void;
  creditScore?: number;
  creditTier?: CreditTier;
}

export function LoanCard({
  borrowerName,
  amount,
  remainingAmount,
  dueDate,
  status,
  type,
  currency = "USD",
  isLender,
  onClick,
  creditScore,
  creditTier,
}: LoanCardProps) {
  const formatAmount = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const typeLabels = {
    personal: "Personal",
    business: "Business",
    group: "Group",
  };

  return (
    <motion.button
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full bg-card border border-border rounded-2xl p-5 transition-all text-left shadow-sm hover:shadow-xl hover:shadow-black/5 relative overflow-hidden group",
        isLender ? "hover:border-indigo-200" : "hover:border-rose-200"
      )}
    >
      {/* Visual Accent Bar */}
      <div className={cn(
        "absolute top-0 left-0 bottom-0 w-1.5 transition-all group-hover:w-2",
        isLender ? "bg-indigo-500" : "bg-rose-500"
      )} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-lg shrink-0",
                isLender ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600"
              )}>
                <User className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-[15px] font-bold tracking-tight text-foreground truncate max-w-[140px]">
                {borrowerName}
              </h3>
            </div>
            {isLender && creditScore !== undefined && creditTier && (
              <div className="scale-90 origin-left">
                <ScoreBadgeCompact score={creditScore} tier={creditTier} />
              </div>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 border border-border px-1.5 py-0.5 rounded-md">
              {typeLabels[type]}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {isLender ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
            <p className="text-xs font-medium text-muted-foreground">
              {isLender ? "Owed to you" : "You owe"}
            </p>
          </div>
        </div>
        <div className="bg-muted/50 p-2 rounded-xl border border-border/50 transition-colors group-hover:bg-primary group-hover:text-white group-hover:border-primary">
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-3xl font-black tabular-nums tracking-tighter mb-1 text-foreground">
            {formatAmount(remainingAmount)}
          </div>
          {remainingAmount !== amount && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full", isLender ? "bg-indigo-500" : "bg-rose-500")}
                  style={{ width: `${(remainingAmount / amount) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                of {formatAmount(amount)}
              </span>
            </div>
          )}
        </div>
        <div className="mb-1 scale-110 origin-bottom-right">
          <StatusTag status={status} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-4">
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 px-2.5 py-1 rounded-lg">
          <Calendar className="w-3.5 h-3.5" />
          <span>Due {formatDate(dueDate)}</span>
        </div>

        {status === "overdue" && (
          <span className="text-[10px] font-black text-rose-500 uppercase animate-pulse">
            Immediate Action
          </span>
        )}
      </div>
    </motion.button>
  );
}

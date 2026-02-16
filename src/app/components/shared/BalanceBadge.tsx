import { cn } from "./ui/utils";

interface BalanceBadgeProps {
  amount: number;
  label: string;
  variant?: "owed-to-you" | "you-owe" | "neutral";
  className?: string;
}

export function BalanceBadge({
  amount,
  label,
  variant = "neutral",
  className,
}: BalanceBadgeProps) {
  const formatAmount = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const variantStyles = {
    "owed-to-you": "bg-green-50 border-green-200",
    "you-owe": "bg-red-50 border-red-200",
    neutral: "bg-gray-50 border-gray-200",
  };

  return (
    <div
      className={cn(
        "flex flex-col p-4 rounded-lg border",
        variantStyles[variant],
        className
      )}
    >
      <span className="text-sm text-muted-foreground mb-1">{label}</span>
      <span className="text-2xl tabular-nums tracking-tight">
        {formatAmount(amount)}
      </span>
    </div>
  );
}

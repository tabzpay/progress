import { cn } from "./ui/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max,
  className,
  showLabel = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-muted-foreground">Paid</span>
          <span className="tabular-nums">
            {formatAmount(value)} of {formatAmount(max)}
          </span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-success h-full transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

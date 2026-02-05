import { cn } from "./ui/utils";

type LoanStatus = "active" | "partial" | "completed" | "overdue";

interface StatusTagProps {
  status: LoanStatus;
  className?: string;
}

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  partial: {
    label: "Partially Paid",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export function StatusTag({ status, className }: StatusTagProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

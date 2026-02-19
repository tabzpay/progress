import { cn } from "../../ui/utils";

type LoanStatus = "active" | "partial" | "completed" | "overdue" | "pending" | string;

interface StatusTagProps {
  status: LoanStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
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
  pending: {
    label: "Pending",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  pending_acceptance: {
    label: "Offer Pending",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
};

export function StatusTag({ status, className }: StatusTagProps) {
  const normalizedStatus = status?.toLowerCase() || "pending";
  const config = statusConfig[normalizedStatus] || {
    label: status || "Unknown",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

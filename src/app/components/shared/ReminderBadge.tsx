import { Bell } from "lucide-react";
import { cn } from "./ui/utils";

interface ReminderBadgeProps {
  count: number;
  className?: string;
}

export function ReminderBadge({ count, className }: ReminderBadgeProps) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs",
        className
      )}
    >
      <Bell className="w-3 h-3" />
      <span>
        {count} reminder{count !== 1 ? "s" : ""} sent
      </span>
    </div>
  );
}

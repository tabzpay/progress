import { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { motion } from "motion/react";

interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: "default" | "glass";
}

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  className,
  variant = "default",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 transition-all",
        variant === "glass" && "bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl",
        className
      )}
    >
      <div className="relative mb-8">
        {illustration ? (
          <img
            src={illustration}
            alt={title}
            className="w-48 h-48 object-contain mb-2 drop-shadow-2xl"
          />
        ) : Icon ? (
          <div className={cn(
            "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-2 shadow-inner transition-transform hover:scale-110",
            variant === "glass" ? "bg-white/20 border border-white/30" : "bg-primary/10 border border-primary/10"
          )}>
            <Icon className={cn(
              "w-10 h-10",
              variant === "glass" ? "text-white" : "text-primary"
            )} />
          </div>
        ) : null}

        {/* Subtle decorative element */}
        <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl -z-10" />
      </div>

      <h3 className={cn(
        "text-2xl font-black mb-3 tracking-tight",
        variant === "glass" ? "text-white" : "text-foreground"
      )}>
        {title}
      </h3>

      <p className={cn(
        "text-sm mb-8 max-w-[280px] leading-relaxed mx-auto",
        variant === "glass" ? "text-white/60" : "text-muted-foreground"
      )}>
        {description}
      </p>

      {actionLabel && onAction && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onAction}
            className={cn(
              "h-12 px-8 rounded-2xl font-bold shadow-xl transition-all",
              variant === "glass" ? "bg-white text-primary hover:bg-white/90" : ""
            )}
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

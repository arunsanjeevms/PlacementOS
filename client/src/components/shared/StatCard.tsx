import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  accentClassName?: string;
  className?: string;
  delay?: number;
}

export function StatCard({ label, value, icon, hint, accentClassName, className, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className={cn("card-hover relative overflow-hidden p-5", className)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          {icon && (
            <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary", accentClassName)}>
              {icon}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

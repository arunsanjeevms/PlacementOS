import { motion } from "framer-motion";
import { Logo } from "./Logo";

export function LoadingScreen({ label = "Loading your workspace…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Logo showText={false} size={56} />
        </motion.div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          {label}
        </div>
      </div>
    </div>
  );
}

/** Inline spinner for buttons / sections. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className ?? "h-4 w-4"}`}
    />
  );
}

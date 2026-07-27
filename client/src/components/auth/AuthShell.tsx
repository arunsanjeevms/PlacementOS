import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

const highlights = [
  "Track Java, DSA & Aptitude roadmaps with progress heatmaps",
  "Pomodoro focus timer that logs every study session",
  "Company tracker, interview journal & mock interview prep",
  "One daily answer: what to study next to get placed",
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern [background-size:32px_32px] opacity-40" />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10">
          <Logo size={40} />
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md text-4xl font-bold leading-tight tracking-tight"
            >
              Your placement prep, <span className="gradient-text">finally organized.</span>
            </motion.h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              The productivity operating system built for one goal — getting you placed.
            </p>
          </div>

          <ul className="space-y-3">
            {highlights.map((h, i) => (
              <motion.li
                key={h}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-3 text-sm text-foreground/90"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {h}
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground">© {new Date().getFullYear()} PlacementOS</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Logo size={36} />
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

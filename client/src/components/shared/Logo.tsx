import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export function Logo({ className, showText = true, size = 32 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="grid place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/25"
        style={{ width: size, height: size }}
      >
        <Target style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2.4} />
      </div>
      {showText && (
        <span className="text-lg font-bold tracking-tight">
          Placement<span className="gradient-text">OS</span>
        </span>
      )}
    </div>
  );
}

import type { Outcome } from "@/types/journal";

export const OUTCOMES: Outcome[] = ["pending", "next_round", "selected", "rejected", "no_result"];

export const OUTCOME_META: Record<Outcome, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-slate-500/15 text-slate-400" },
  next_round: { label: "Next Round", className: "bg-blue-500/15 text-blue-400" },
  selected: { label: "Selected", className: "bg-emerald-500/15 text-emerald-400" },
  rejected: { label: "Rejected", className: "bg-rose-500/15 text-rose-400" },
  no_result: { label: "No Result", className: "bg-amber-500/15 text-amber-400" },
};

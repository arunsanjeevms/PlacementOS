export const COMPANY_STATUSES = [
  "wishlist",
  "preparing",
  "applied",
  "online_assessment",
  "interview",
  "offer",
  "rejected",
] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const COMPANY_STATUS_META: Record<CompanyStatus, { label: string; className: string; dot: string }> = {
  wishlist: { label: "Wishlist", className: "bg-slate-500/15 text-slate-400", dot: "bg-slate-400" },
  preparing: { label: "Preparing", className: "bg-violet-500/15 text-violet-400", dot: "bg-violet-400" },
  applied: { label: "Applied", className: "bg-blue-500/15 text-blue-400", dot: "bg-blue-400" },
  online_assessment: { label: "OA", className: "bg-cyan-500/15 text-cyan-400", dot: "bg-cyan-400" },
  interview: { label: "Interview", className: "bg-amber-500/15 text-amber-400", dot: "bg-amber-400" },
  offer: { label: "Offer", className: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400" },
  rejected: { label: "Rejected", className: "bg-rose-500/15 text-rose-400", dot: "bg-rose-400" },
};

/** Popular companies for the quick-add picker. */
export const POPULAR_COMPANIES = [
  "Amazon",
  "Zoho",
  "Microsoft",
  "Google",
  "Oracle",
  "Cisco",
  "Adobe",
  "TCS",
  "Infosys",
  "Capgemini",
  "Accenture",
];

export const ROUND_STATUS_META = {
  pending: { label: "Pending", className: "text-muted-foreground" },
  cleared: { label: "Cleared", className: "text-emerald-400" },
  failed: { label: "Failed", className: "text-rose-400" },
};

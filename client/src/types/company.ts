import type { CompanyStatus } from "@/constants/companies";

export interface Round {
  _id: string;
  name: string;
  status: "pending" | "cleared" | "failed";
  date?: string;
  notes?: string;
}
export interface LinkItem {
  label: string;
  url: string;
}

export interface Company {
  _id: string;
  user: string;
  name: string;
  role?: string;
  ctc?: string;
  location?: string;
  eligibility?: string;
  status: CompanyStatus;
  applied: boolean;
  resumeSent: boolean;
  interviewDate?: string;
  deadline?: string;
  preparationProgress: number;
  rounds: Round[];
  oaPattern?: string;
  hrQuestions: string[];
  technicalQuestions: string[];
  notes?: string;
  resources: LinkItem[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyInput {
  name: string;
  role?: string;
  ctc?: string;
  location?: string;
  eligibility?: string;
  status?: CompanyStatus;
  applied?: boolean;
  resumeSent?: boolean;
  interviewDate?: string | null;
  deadline?: string | null;
  preparationProgress?: number;
  oaPattern?: string;
  hrQuestions?: string[];
  technicalQuestions?: string[];
  notes?: string;
  resources?: LinkItem[];
}

export interface CompanySummary {
  byStatus: Record<string, number>;
  total: number;
  applied: number;
  avgProgress: number;
}

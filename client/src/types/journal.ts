export type JournalType = "real" | "mock";
export type Outcome = "pending" | "selected" | "rejected" | "next_round" | "no_result";

export interface JournalEntry {
  _id: string;
  user: string;
  type: JournalType;
  company: string;
  role?: string;
  date: string;
  round?: string;
  interviewer?: string;
  questionsAsked: string[];
  questionsMissed: string[];
  mistakes?: string;
  conceptsToRevise: string[];
  confidence: number;
  outcome: Outcome;
  feedback?: string;
  nextAction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalInput {
  type: JournalType;
  company: string;
  role?: string;
  date: string;
  round?: string;
  interviewer?: string;
  questionsAsked?: string[];
  questionsMissed?: string[];
  mistakes?: string;
  conceptsToRevise?: string[];
  confidence?: number;
  outcome?: Outcome;
  feedback?: string;
  nextAction?: string;
}

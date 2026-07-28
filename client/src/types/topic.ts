export type TrackerKind = "java" | "dsa" | "aptitude" | "core";
export type TopicStatus = "not_started" | "learning" | "completed";

export interface Count {
  solved: number;
  total: number;
}
export interface LinkItem {
  label: string;
  url: string;
}

export interface Topic {
  _id: string;
  user: string;
  kind: TrackerKind;
  name: string;
  order: number;
  status: TopicStatus;
  completion: number;
  practiceQuestions: number;
  easy: Count;
  medium: Count;
  hard: Count;
  solved: number;
  accuracy: number;
  practiceMinutes: number;
  avgTimeSeconds: number;
  revisionCount: number;
  isWeak: boolean;
  notes?: string;
  bookmarks: LinkItem[];
  resources: LinkItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackerSummary {
  kind: TrackerKind;
  totalTopics: number;
  completedTopics: number;
  weakTopics: number;
  progress: number;
  solved?: number;
  total?: number;
  byDifficulty?: { easy: Count; medium: Count; hard: Count };
  avgAccuracy?: number;
  totalSolved?: number;
  practiceMinutes?: number;
}

export type TopicPatch = Partial<
  Pick<
    Topic,
    | "name"
    | "status"
    | "completion"
    | "practiceQuestions"
    | "easy"
    | "medium"
    | "hard"
    | "solved"
    | "accuracy"
    | "practiceMinutes"
    | "avgTimeSeconds"
    | "revisionCount"
    | "isWeak"
    | "notes"
    | "bookmarks"
    | "resources"
  >
>;

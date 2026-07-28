import type { TrackerKind } from "./enums.js";

/** Seed topics for a new user, per tracker. Ordered by placement priority. */
export const DEFAULT_TOPICS: Record<TrackerKind, string[]> = {
  java: [
    "Basics",
    "OOP",
    "Collections",
    "Exception Handling",
    "Generics",
    "Comparable & Comparator",
    "Streams",
    "Lambda",
    "Java 8 Features",
    "File Handling",
    "JDBC",
    "Multithreading",
    "Networking",
    "Spring Boot",
    "REST APIs",
  ],
  dsa: [
    "Arrays",
    "Strings",
    "Two Pointers",
    "Sliding Window",
    "Binary Search",
    "HashMap",
    "Stack",
    "Queue",
    "Linked List",
    "Trees",
    "BST",
    "Heap",
    "Trie",
    "Graph",
    "Dynamic Programming",
    "Greedy",
    "Recursion",
    "Backtracking",
    "Bit Manipulation",
    "Math",
  ],
  aptitude: [
    // Quantitative — Level 1 (appear in almost every company)
    "Number System",
    "Percentages",
    "Profit & Loss",
    "Ratio & Proportion",
    "Averages",
    "Simple & Compound Interest",
    "Time & Work",
    "Pipes & Cisterns",
    "Time Speed Distance",
    "Ages",
    "Mixtures & Alligations",
    // Logical — ★★★★★
    "Seating Arrangement",
    "Puzzles",
    "Blood Relations",
    "Coding Decoding",
    "Direction Sense",
    "Syllogism",
    "Number Series",
    // Level 2
    "Permutation & Combination",
    "Probability",
    "Clocks",
    "Calendars",
    "Logarithms",
    "Progressions",
    "Geometry & Mensuration",
    // DI & DS
    "Data Interpretation",
    "Data Sufficiency",
    // Verbal — ★★★★★
    "Reading Comprehension",
    "Sentence Correction",
    "Error Spotting",
    "Para Jumbles",
    "Vocabulary",
  ],
  core: [
    "SQL",
    "DBMS",
    "Operating Systems",
    "Computer Networks",
    "OOPS Concepts",
    "System Design Basics",
    "Git & GitHub",
    "Web Development",
    "Resume & Projects",
    "HR Interview",
    "Group Discussion",
    "Communication",
  ],
};

interface DsaTotals {
  easy: number;
  medium: number;
  hard: number;
}

/** Fallback problem targets for DSA topics without a specific target. */
export const DSA_DEFAULT_TOTALS: DsaTotals = { easy: 3, medium: 5, hard: 2 };

/**
 * Per-topic problem targets (~300–350 quality problems overall), split
 * roughly 30% easy / 50% medium / 20% hard.
 */
export const DSA_TOPIC_TOTALS: Record<string, DsaTotals> = {
  Arrays: { easy: 9, medium: 15, hard: 6 },
  Strings: { easy: 9, medium: 15, hard: 6 },
  "Two Pointers": { easy: 6, medium: 10, hard: 4 },
  "Sliding Window": { easy: 6, medium: 10, hard: 4 },
  "Binary Search": { easy: 8, medium: 12, hard: 5 },
  HashMap: { easy: 6, medium: 10, hard: 4 },
  Stack: { easy: 6, medium: 10, hard: 4 },
  Queue: { easy: 5, medium: 7, hard: 3 },
  "Linked List": { easy: 9, medium: 15, hard: 6 },
  Trees: { easy: 12, medium: 20, hard: 8 },
  BST: { easy: 6, medium: 10, hard: 4 },
  Heap: { easy: 5, medium: 7, hard: 3 },
  Trie: { easy: 3, medium: 5, hard: 2 },
  Graph: { easy: 12, medium: 20, hard: 8 },
  "Dynamic Programming": { easy: 10, medium: 18, hard: 7 },
  Greedy: { easy: 5, medium: 7, hard: 3 },
  Recursion: { easy: 6, medium: 10, hard: 4 },
  Backtracking: { easy: 6, medium: 10, hard: 4 },
  "Bit Manipulation": { easy: 3, medium: 5, hard: 2 },
  Math: { easy: 3, medium: 5, hard: 2 },
};

import dayjs from "dayjs";

/** YYYY-MM-DD key for a date. */
export function dateKey(date: Date | string | dayjs.Dayjs): string {
  return dayjs(date).format("YYYY-MM-DD");
}

export function todayKey(): string {
  return dayjs().format("YYYY-MM-DD");
}

export function shiftKey(key: string, days: number): string {
  return dayjs(key).add(days, "day").format("YYYY-MM-DD");
}

/**
 * Compute current & longest streaks from a set of active day-keys.
 * Current streak counts back from today (or yesterday, so a not-yet-studied
 * today doesn't immediately break an ongoing streak).
 */
export function computeStreaks(dayKeys: Iterable<string>): { current: number; longest: number } {
  const set = new Set(dayKeys);
  if (set.size === 0) return { current: 0, longest: 0 };

  const sorted = [...set].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of sorted) {
    run = prev && shiftKey(prev, 1) === k ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = k;
  }

  let current = 0;
  let cursor = todayKey();
  if (!set.has(cursor)) cursor = shiftKey(cursor, -1); // grace: allow streak to continue from yesterday
  while (set.has(cursor)) {
    current++;
    cursor = shiftKey(cursor, -1);
  }

  return { current, longest };
}

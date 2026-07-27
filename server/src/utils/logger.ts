/* Tiny structured logger — avoids a heavy dependency while giving leveled, timestamped output. */

type Level = "info" | "warn" | "error" | "debug";

const colors: Record<Level, string> = {
  info: "\x1b[36m", // cyan
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
  debug: "\x1b[90m", // gray
};
const reset = "\x1b[0m";

function log(level: Level, message: string, meta?: unknown): void {
  const time = new Date().toISOString();
  const prefix = `${colors[level]}[${level.toUpperCase()}]${reset} ${time}`;
  if (meta !== undefined) {
    // eslint-disable-next-line no-console
    console[level === "debug" ? "log" : level](`${prefix} ${message}`, meta);
  } else {
    // eslint-disable-next-line no-console
    console[level === "debug" ? "log" : level](`${prefix} ${message}`);
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => log("info", msg, meta),
  warn: (msg: string, meta?: unknown) => log("warn", msg, meta),
  error: (msg: string, meta?: unknown) => log("error", msg, meta),
  debug: (msg: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== "production") log("debug", msg, meta);
  },
};

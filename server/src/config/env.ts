import dotenv from "dotenv";

dotenv.config();

/** Parse a value that may be missing, with a fallback. */
function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

const isProd = process.env.NODE_ENV === "production";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd,
  isDev: !isProd,
  port: Number(process.env.PORT ?? 5000),

  /** Allowed CORS origins (comma separated). Trailing slashes are stripped so
   * "https://x.vercel.app/" and "https://x.vercel.app" both match — browsers
   * never send a trailing slash in the Origin header, so a pasted URL with
   * one is a common source of otherwise-invisible CORS failures. */
  clientUrls: optional("CLIENT_URL", "http://localhost:5173")
    .split(",")
    .map((u) => u.trim().replace(/\/+$/, ""))
    .filter(Boolean),

  mongoUri: required("MONGODB_URI", isProd ? undefined : "mongodb://127.0.0.1:27017/placementos"),

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET", isProd ? undefined : "dev-access-secret-change-me"),
    refreshSecret: required("JWT_REFRESH_SECRET", isProd ? undefined : "dev-refresh-secret-change-me"),
    accessExpires: optional("JWT_ACCESS_EXPIRES", "15m"),
    refreshExpires: optional("JWT_REFRESH_EXPIRES", "30d"),
  },

  cookieDomain: optional("COOKIE_DOMAIN") || undefined,

  email: {
    resendApiKey: optional("RESEND_API_KEY"),
    from: optional("EMAIL_FROM", "PlacementOS <onboarding@resend.dev>"),
  },

  cron: {
    secret: optional("CRON_SECRET", "dev-cron-secret"),
    enabled: optional("ENABLE_CRON", "true") !== "false",
  },
} as const;

export type Env = typeof env;

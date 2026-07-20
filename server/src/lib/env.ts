import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || "",
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "PlacementOS <onboarding@resend.dev>",
  cronSecret: process.env.CRON_SECRET || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  /** When no Supabase secret is configured, the API runs in demo mode with a single local user. */
  get demoMode() {
    return !this.supabaseJwtSecret;
  },
};

import { registerJob } from "./index.js";
import { sendMorningDigests, sendNightSummaries } from "../services/reminder.service.js";

/**
 * Register all scheduled jobs. Imported once at boot (before startCronJobs).
 * Times are in Asia/Kolkata (configured on the scheduler).
 */
registerJob({ name: "morning-digest", schedule: "0 7 * * *", task: async () => void (await sendMorningDigests()) });
registerJob({ name: "night-summary", schedule: "30 21 * * *", task: async () => void (await sendNightSummaries()) });

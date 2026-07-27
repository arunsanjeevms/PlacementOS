import cron from "node-cron";
import { logger } from "../utils/logger.js";

type Job = { schedule: string; name: string; task: () => Promise<void> | void };

const jobs: Job[] = [];

/** Modules register their scheduled jobs here (morning digest, night summary, etc.). */
export function registerJob(job: Job): void {
  jobs.push(job);
}

/** Starts every registered cron job. Called from bootstrap when ENABLE_CRON=true. */
export function startCronJobs(): void {
  if (jobs.length === 0) {
    logger.info("Cron: no jobs registered yet");
    return;
  }
  for (const job of jobs) {
    if (!cron.validate(job.schedule)) {
      logger.error(`Cron: invalid schedule "${job.schedule}" for ${job.name}`);
      continue;
    }
    cron.schedule(
      job.schedule,
      () => {
        logger.info(`Cron: running ${job.name}`);
        Promise.resolve(job.task()).catch((err) => logger.error(`Cron job ${job.name} failed`, err));
      },
      { timezone: "Asia/Kolkata" }
    );
    logger.info(`Cron: scheduled ${job.name} (${job.schedule})`);
  }
}

/** Runs a single named job on demand (used by the /api/cron ping endpoint). */
export async function runJob(name: string): Promise<boolean> {
  const job = jobs.find((j) => j.name === name);
  if (!job) return false;
  await job.task();
  return true;
}

export function listJobs(): string[] {
  return jobs.map((j) => j.name);
}

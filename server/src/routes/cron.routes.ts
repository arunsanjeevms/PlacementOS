import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";
import { listJobs, runJob } from "../cron/index.js";
import { env } from "../config/env.js";

const router = Router();

/** Verify the shared cron secret (header or query) so only trusted schedulers can trigger jobs. */
function checkSecret(secret: unknown): void {
  if (secret !== env.cron.secret) throw ApiError.unauthorized("Invalid cron secret");
}

router.get("/", (req, res) => {
  checkSecret(req.headers["x-cron-secret"] ?? req.query.secret);
  return sendSuccess(res, { jobs: listJobs() }, "Registered jobs");
});

router.post(
  "/:name",
  asyncHandler(async (req, res) => {
    checkSecret(req.headers["x-cron-secret"] ?? req.query.secret);
    const ran = await runJob(req.params.name);
    if (!ran) throw ApiError.notFound(`No such job: ${req.params.name}`);
    return sendSuccess(res, { job: req.params.name }, "Job executed");
  })
);

export default router;

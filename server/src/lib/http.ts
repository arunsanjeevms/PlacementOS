import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

export const asyncH =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export function parseBody<T extends z.ZodTypeAny>(schema: T, req: Request): z.infer<T> {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const err = new Error(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    (err as Error & { status?: number }).status = 400;
    throw err;
  }
  return result.data;
}

export const zDate = z.preprocess(
  (v) => (typeof v === "string" && v ? new Date(v) : v === "" ? null : v),
  z.date().nullable().optional()
);

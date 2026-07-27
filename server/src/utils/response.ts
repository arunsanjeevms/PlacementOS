import type { Response } from "express";

interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

/** Uniform success envelope so the client always sees { success, message, data, meta }. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "OK",
  statusCode = 200,
  meta?: Meta
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendCreated<T>(res: Response, data: T, message = "Created"): Response {
  return sendSuccess(res, data, message, 201);
}

import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { cookieNames, verifyAccessToken, type UserRole } from "../utils/tokens.js";

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
}

// Augment Express Request with the authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Extracts a bearer token from Authorization header or the HTTP-only access cookie. */
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  const cookie = (req.cookies as Record<string, string> | undefined)?.[cookieNames.access];
  return cookie ?? null;
}

/** Requires a valid access token; attaches req.user. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized("Authentication required"));
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    next(err);
  }
};

/** Attaches req.user when a token is present but never blocks the request. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role, email: payload.email };
    } catch {
      /* ignore invalid token in optional mode */
    }
  }
  next();
};

/** Role-based access control — use after requireAuth. */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden("Insufficient permissions"));
    next();
  };
}

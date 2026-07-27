import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import { globalLimiter } from "./middlewares/rateLimit.js";

export function createApp(): Application {
  const app = express();

  app.set("trust proxy", 1); // behind Render's proxy — needed for secure cookies & rate-limit ip

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin / server-to-server (no origin) and whitelisted client URLs.
        if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin not allowed by CORS: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (env.isDev) app.use(morgan("dev"));
  app.use("/api", globalLimiter);

  app.get("/", (_req, res) => {
    res.json({ name: "PlacementOS API", status: "ok", docs: "/api/health" });
  });
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "healthy", uptime: process.uptime(), env: env.nodeEnv });
  });

  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

mongoose.set("strictQuery", true);

let isConnected = false;

/** Connect to MongoDB Atlas. Retries with backoff so a cold Render/Atlas start doesn't crash boot. */
export async function connectDatabase(retries = 5, delayMs = 3000): Promise<void> {
  if (isConnected) return;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 10_000,
        autoIndex: env.isDev,
      });
      isConnected = true;
      logger.info(`MongoDB connected → ${mongoose.connection.name}`);

      mongoose.connection.on("disconnected", () => {
        isConnected = false;
        logger.warn("MongoDB disconnected");
      });
      mongoose.connection.on("error", (err) => logger.error("MongoDB error", err));
      return;
    } catch (err) {
      logger.error(`MongoDB connection failed (attempt ${attempt}/${retries})`, err);
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}

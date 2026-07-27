import { Router } from "express";
import authRoutes from "./auth.routes.js";
import taskRoutes from "./task.routes.js";
import sessionRoutes from "./session.routes.js";

const router = Router();

/** Mounts every module router under /api. New modules are added here as they land. */
router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/sessions", sessionRoutes);

export default router;

import { Router } from "express";
import authRoutes from "./auth.routes.js";
import taskRoutes from "./task.routes.js";
import sessionRoutes from "./session.routes.js";
import topicRoutes from "./topic.routes.js";
import projectRoutes from "./project.routes.js";
import noteRoutes from "./note.routes.js";
import resourceRoutes from "./resource.routes.js";
import companyRoutes from "./company.routes.js";
import journalRoutes from "./journal.routes.js";

const router = Router();

/** Mounts every module router under /api. New modules are added here as they land. */
router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/sessions", sessionRoutes);
router.use("/topics", topicRoutes);
router.use("/projects", projectRoutes);
router.use("/notes", noteRoutes);
router.use("/resources", resourceRoutes);
router.use("/companies", companyRoutes);
router.use("/journal", journalRoutes);

export default router;

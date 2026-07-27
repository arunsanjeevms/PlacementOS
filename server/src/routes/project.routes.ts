import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/project.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate, objectId } from "../middlewares/validate.js";
import { createProjectSchema, updateProjectSchema, reorderProjectSchema, checklistSchema } from "../validators/project.validator.js";

const router = Router();
router.use(requireAuth);

const idParams = z.object({ id: objectId });
const itemParams = z.object({ id: objectId, itemId: objectId });

router.get("/", ctrl.listProjects);
router.post("/", validate({ body: createProjectSchema }), ctrl.createProject);
router.patch("/reorder", validate({ body: reorderProjectSchema }), ctrl.reorderProjects);
router.get("/:id", validate({ params: idParams }), ctrl.getProject);
router.patch("/:id", validate({ params: idParams, body: updateProjectSchema }), ctrl.updateProject);
router.delete("/:id", validate({ params: idParams }), ctrl.deleteProject);

// Milestones
router.post("/:id/milestones", validate({ params: idParams, body: checklistSchema }), ctrl.milestoneOps.add);
router.patch("/:id/milestones/:itemId/toggle", validate({ params: itemParams }), ctrl.milestoneOps.toggle);
router.delete("/:id/milestones/:itemId", validate({ params: itemParams }), ctrl.milestoneOps.remove);

// Tasks
router.post("/:id/tasks", validate({ params: idParams, body: checklistSchema }), ctrl.taskOps.add);
router.patch("/:id/tasks/:itemId/toggle", validate({ params: itemParams }), ctrl.taskOps.toggle);
router.delete("/:id/tasks/:itemId", validate({ params: itemParams }), ctrl.taskOps.remove);

export default router;

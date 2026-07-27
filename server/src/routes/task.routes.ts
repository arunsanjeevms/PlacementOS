import { Router } from "express";
import * as ctrl from "../controllers/task.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate, objectId } from "../middlewares/validate.js";
import { z } from "zod";
import {
  createTaskSchema,
  updateTaskSchema,
  listTaskQuerySchema,
  reorderSchema,
  subtaskSchema,
} from "../validators/task.validator.js";

const router = Router();
router.use(requireAuth);

const idParams = z.object({ id: objectId });
const subParams = z.object({ id: objectId, subId: objectId });

router.get("/", validate({ query: listTaskQuerySchema }), ctrl.listTasks);
router.get("/summary", ctrl.getTaskSummary);
router.post("/", validate({ body: createTaskSchema }), ctrl.createTask);
router.patch("/reorder", validate({ body: reorderSchema }), ctrl.reorderTasks);

router.get("/:id", validate({ params: idParams }), ctrl.getTask);
router.patch("/:id", validate({ params: idParams, body: updateTaskSchema }), ctrl.updateTask);
router.patch("/:id/toggle", validate({ params: idParams }), ctrl.toggleTask);
router.delete("/:id", validate({ params: idParams }), ctrl.deleteTask);

router.post("/:id/subtasks", validate({ params: idParams, body: subtaskSchema }), ctrl.addSubtask);
router.patch("/:id/subtasks/:subId/toggle", validate({ params: subParams }), ctrl.toggleSubtask);
router.delete("/:id/subtasks/:subId", validate({ params: subParams }), ctrl.deleteSubtask);

export default router;

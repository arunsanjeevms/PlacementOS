import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/session.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate, objectId } from "../middlewares/validate.js";
import { createSessionSchema, listSessionQuerySchema, updateSessionSchema } from "../validators/session.validator.js";

const router = Router();
router.use(requireAuth);

const idParams = z.object({ id: objectId });

router.get("/", validate({ query: listSessionQuerySchema }), ctrl.listSessions);
router.get("/summary", ctrl.getSessionSummary);
router.post("/", validate({ body: createSessionSchema }), ctrl.createSession);
router.patch("/:id", validate({ params: idParams, body: updateSessionSchema }), ctrl.updateSession);
router.delete("/:id", validate({ params: idParams }), ctrl.deleteSession);

export default router;

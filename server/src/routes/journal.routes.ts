import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/journal.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate, objectId } from "../middlewares/validate.js";
import { createJournalSchema, updateJournalSchema, listJournalQuerySchema } from "../validators/journal.validator.js";

const router = Router();
router.use(requireAuth);

const idParams = z.object({ id: objectId });

router.get("/", validate({ query: listJournalQuerySchema }), ctrl.listJournals);
router.post("/", validate({ body: createJournalSchema }), ctrl.createJournal);
router.patch("/:id", validate({ params: idParams, body: updateJournalSchema }), ctrl.updateJournal);
router.delete("/:id", validate({ params: idParams }), ctrl.deleteJournal);

export default router;

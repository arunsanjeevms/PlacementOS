import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/note.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate, objectId } from "../middlewares/validate.js";
import {
  createFolderSchema,
  updateFolderSchema,
  createNoteSchema,
  updateNoteSchema,
  listNoteQuerySchema,
} from "../validators/note.validator.js";

const router = Router();
router.use(requireAuth);

const idParams = z.object({ id: objectId });

// Folders (nested under /notes to keep one mount)
router.get("/folders", ctrl.listFolders);
router.post("/folders", validate({ body: createFolderSchema }), ctrl.createFolder);
router.patch("/folders/:id", validate({ params: idParams, body: updateFolderSchema }), ctrl.updateFolder);
router.delete("/folders/:id", validate({ params: idParams }), ctrl.deleteFolder);

// Notes
router.get("/", validate({ query: listNoteQuerySchema }), ctrl.listNotes);
router.post("/", validate({ body: createNoteSchema }), ctrl.createNote);
router.delete("/trash/empty", ctrl.emptyTrash);
router.get("/:id", validate({ params: idParams }), ctrl.getNote);
router.get("/:id/backlinks", validate({ params: idParams }), ctrl.getBacklinks);
router.patch("/:id", validate({ params: idParams, body: updateNoteSchema }), ctrl.updateNote);
router.delete("/:id", validate({ params: idParams }), ctrl.deleteNote);

export default router;

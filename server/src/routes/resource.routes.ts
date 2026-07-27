import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/resource.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate, objectId } from "../middlewares/validate.js";
import {
  createResourceSchema,
  updateResourceSchema,
  listResourceQuerySchema,
  bulkSchema,
  importSchema,
} from "../validators/resource.validator.js";

const router = Router();
router.use(requireAuth);

const idParams = z.object({ id: objectId });

router.get("/", validate({ query: listResourceQuerySchema }), ctrl.listResources);
router.get("/summary", ctrl.getResourceSummary);
router.get("/export", ctrl.exportResources);
router.post("/", validate({ body: createResourceSchema }), ctrl.createResource);
router.post("/import", validate({ body: importSchema }), ctrl.importResources);
router.post("/bulk", validate({ body: bulkSchema }), ctrl.bulkResources);
router.patch("/:id", validate({ params: idParams, body: updateResourceSchema }), ctrl.updateResource);
router.delete("/:id", validate({ params: idParams }), ctrl.deleteResource);

export default router;

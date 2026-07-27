import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/topic.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate, objectId } from "../middlewares/validate.js";
import { createTopicSchema, listTopicQuerySchema, reorderTopicSchema, updateTopicSchema } from "../validators/topic.validator.js";

const router = Router();
router.use(requireAuth);

const idParams = z.object({ id: objectId });

router.get("/", validate({ query: listTopicQuerySchema }), ctrl.listTopics);
router.get("/summary", validate({ query: listTopicQuerySchema }), ctrl.getTopicSummary);
router.post("/", validate({ body: createTopicSchema }), ctrl.createTopic);
router.patch("/reorder", validate({ body: reorderTopicSchema }), ctrl.reorderTopics);
router.patch("/:id", validate({ params: idParams, body: updateTopicSchema }), ctrl.updateTopic);
router.delete("/:id", validate({ params: idParams }), ctrl.deleteTopic);

export default router;

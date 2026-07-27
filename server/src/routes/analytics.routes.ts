import { Router } from "express";
import * as ctrl from "../controllers/analytics.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/dashboard", ctrl.dashboard);
router.get("/heatmap", ctrl.heatmap);
router.get("/heatmap/day", ctrl.dayDetail);
router.get("/statistics", ctrl.statistics);
router.get("/readiness", ctrl.readiness);
router.get("/achievements", ctrl.achievements);

export default router;

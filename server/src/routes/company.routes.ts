import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/company.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate, objectId } from "../middlewares/validate.js";
import { createCompanySchema, updateCompanySchema, listCompanyQuerySchema, roundSchema, updateRoundSchema } from "../validators/company.validator.js";

const router = Router();
router.use(requireAuth);

const idParams = z.object({ id: objectId });
const roundParams = z.object({ id: objectId, roundId: objectId });

router.get("/", validate({ query: listCompanyQuerySchema }), ctrl.listCompanies);
router.get("/summary", ctrl.getCompanySummary);
router.post("/", validate({ body: createCompanySchema }), ctrl.createCompany);
router.get("/:id", validate({ params: idParams }), ctrl.getCompany);
router.patch("/:id", validate({ params: idParams, body: updateCompanySchema }), ctrl.updateCompany);
router.delete("/:id", validate({ params: idParams }), ctrl.deleteCompany);

router.post("/:id/rounds", validate({ params: idParams, body: roundSchema }), ctrl.addRound);
router.patch("/:id/rounds/:roundId", validate({ params: roundParams, body: updateRoundSchema }), ctrl.updateRound);
router.delete("/:id/rounds/:roundId", validate({ params: roundParams }), ctrl.deleteRound);

export default router;

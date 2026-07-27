import { Router } from "express";
import * as ctrl from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema, updatePreferencesSchema, changePasswordSchema } from "../validators/user.validator.js";

const router = Router();
router.use(requireAuth);

router.patch("/me", validate({ body: updateProfileSchema }), ctrl.updateProfile);
router.patch("/me/preferences", validate({ body: updatePreferencesSchema }), ctrl.updatePreferences);
router.post("/me/change-password", validate({ body: changePasswordSchema }), ctrl.changePassword);
router.get("/me/export", ctrl.exportData);
router.delete("/me", ctrl.deleteAccount);

export default router;

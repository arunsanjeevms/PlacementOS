import { Router } from "express";
import * as ctrl from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", authLimiter, validate({ body: registerSchema }), ctrl.register);
router.post("/login", authLimiter, validate({ body: loginSchema }), ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", requireAuth, ctrl.logout);
router.post("/logout-all", requireAuth, ctrl.logoutAll);
router.get("/me", requireAuth, ctrl.me);

router.post("/forgot-password", authLimiter, validate({ body: forgotPasswordSchema }), ctrl.forgotPassword);
router.post("/reset-password", authLimiter, validate({ body: resetPasswordSchema }), ctrl.resetPassword);
router.post("/verify-email", validate({ body: verifyEmailSchema }), ctrl.verifyEmail);
router.post("/resend-verification", requireAuth, ctrl.resendVerification);

export default router;

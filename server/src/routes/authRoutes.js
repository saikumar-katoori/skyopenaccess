import { Router } from "express";
import {
	loginAdmin,
	me,
	resendAdminVerification,
	requestForgotPassword,
	resetForgotPassword,
	verifyAdminEmail,
	verifyAdminTwoFactor
} from "../controllers/authController.js";
import { adminOnly, protect } from "../middlewares/auth.js";
import { authLoginLimiter, authVerificationLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/login", authLoginLimiter, loginAdmin);
router.post("/verify-email", authVerificationLimiter, verifyAdminEmail);
router.post("/resend-verification", authVerificationLimiter, resendAdminVerification);
router.post("/verify-2fa", authVerificationLimiter, verifyAdminTwoFactor);
router.post("/forgot-password-request", authVerificationLimiter, requestForgotPassword);
router.post("/forgot-password-reset", authVerificationLimiter, resetForgotPassword);
router.get("/me", protect, adminOnly, me);

export default router;

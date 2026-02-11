const express = require("express");
const router = express.Router();
const { signIn, signUp, verifyEmail, forgotPassword, resetPassword } = require("../../controllers/authController");
const { validate } = require("../../middlewares/validate");
const { auth: authSchema } = require("../../schemas");
const { authLimiter, passwordResetLimiter } = require("../../middlewares/rateLimiter");

router.post("/signin", authLimiter, validate(authSchema.signIn), signIn);
router.post("/signup", authLimiter, validate(authSchema.signUp), signUp);
router.post("/verify-email", validate(authSchema.verifyEmail), verifyEmail);
router.post("/forgot-password", passwordResetLimiter, validate(authSchema.forgotPassword), forgotPassword);

router.post("/reset-password", passwordResetLimiter, validate(authSchema.resetPassword), resetPassword);

module.exports = router;

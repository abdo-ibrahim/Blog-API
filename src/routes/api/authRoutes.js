const express = require("express");
const router = express.Router();
const { signIn, signUp, verifyEmail, forgotPassword, resetPassword } = require("../../controllers/authController");
const { validate } = require("../../middlewares/validate");
const { auth: authSchema } = require("../../schemas");
const limiter = require("../../middlewares/rateLimiter");

router.post("/signin", validate(authSchema.signIn), signIn);
router.post("/signup", validate(authSchema.signUp), signUp);
router.post("/verify-email", validate(authSchema.verifyEmail), verifyEmail);
router.post("/forgot-password", limiter.passwordResetLimiter, validate(authSchema.forgotPassword), forgotPassword);

router.post("/reset-password", limiter.passwordResetLimiter, validate(authSchema.resetPassword), resetPassword);

module.exports = router;

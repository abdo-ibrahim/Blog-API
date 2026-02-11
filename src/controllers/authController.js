const AuthService = require("../services/authService");

/**
 * @desc  Register new user
 * @route auth/signup
 * @method POST
 * @access public
 */
exports.signUp = async (req, res, next) => {
  const user = await AuthService.signUp(req.body);
  res.status(201).json({ message: "User registered successfully", data: user });
};

/**
 * @desc  Login user
 * @route auth/signin
 * @method POST
 * @access public
 */
exports.signIn = async (req, res, next) => {
  const data = await AuthService.signIn(req.body);
  res.status(200).json({ message: "User signed in successfully", data });
};

/**
 * @desc  Verify email
 * @route auth/verify-email
 * @method POST
 * @access public
 */
exports.verifyEmail = async (req, res, next) => {
  await AuthService.verifyEmail(req.body);
  res.status(200).json({ message: "Email verified successfully" });
};

/**
 * @desc Forgot password
 * @route auth/forgot-password
 * @method POST
 * @access public
 */
exports.forgotPassword = async (req, res, next) => {
  await AuthService.forgotPassword(req.body);
  res.status(200).json({
    status: "success",
    message: "Password reset link sent to your email",
  });
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password?token=resetToken
 * @method  POST
 * @access public
 */
exports.resetPassword = async (req, res, next) => {
  const { token } = req.query;
  const { password, confirmPassword } = req.body;
  await AuthService.resetPassword({ token, password, confirmPassword });
  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
};

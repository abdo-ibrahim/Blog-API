const crypto = require("crypto");
const User = require("../models/userModel");
const AppError = require("../utils/appErrors");
const { createToken } = require("../utils/JWT");
const { sendVerificationEmailOTP } = require("../nodemailer/sendVerificationEmailOTP");
const { sendPasswordToken } = require("../nodemailer/sendPasswordResetToken");
const { sendPasswordResetSuccess } = require("../nodemailer/sendPasswordResetSuccess");

class AuthService {
  // Register new user
  static async signUp(userData) {
    const { email } = userData;

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    const newUser = await User.create({
      ...userData,
    });

    const verificationToken = newUser.createOTP();

    await newUser.save({ validateBeforeSave: false });

    // Send verification email
    await sendVerificationEmailOTP(newUser, verificationToken);

    return { ...newUser.toObject(), password: undefined, confirmPassword: undefined };
  }

  // Login user
  static async signIn(userData) {
    const { email, password } = userData;
    // check if email already exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }
    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }
    // check is verified and isActive
    if (!user.isVerified) {
      throw new AppError("Please verify your email to login", 401);
    }
    if (!user.isActive) {
      throw new AppError("Your account is deactivated. Please contact support.", 403);
    }
    // create token
    const token = await createToken(user);
    return { token, user: { ...user.toObject(), password: undefined, confirmPassword: undefined } };
  }
  // verify email
  static async verifyEmail({ code }) {
    if (!code) {
      throw new AppError("Verification code is required", 400);
    }
    const user = await User.findOne({
      OTP: code,
      OTPExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new AppError("Invalid or expired verification code", 400);
    }
    user.isVerified = true;
    user.OTP = undefined;
    user.OTPExpires = undefined;
    await user.save();
    return { ...user.toObject(), password: undefined, confirmPassword: undefined };
  }

  // forgot password
  static async forgotPassword({ email }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("User not found", 400);
    }
    // Send reset password email
    await sendPasswordToken(user);
    return;
  }

  // reset password
  static async resetPassword({ token, password, confirmPassword }) {
    if (!token) {
      throw new AppError("Token is required", 400);
    }
    if (!password || !confirmPassword) {
      throw new AppError("Password and confirm password are required", 400);
    }
    if (password !== confirmPassword) {
      throw new AppError("Password and confirm password do not match", 400);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      throw new AppError("Invalid or expired token", 400);
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    // Send password reset success email
    await sendPasswordResetSuccess(user);
    return;
  }
}
module.exports = AuthService;

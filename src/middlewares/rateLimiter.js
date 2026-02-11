const { rateLimit } = require("express-rate-limit");
const AppError = require("../utils/appErrors");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  handler: (req, res, next) => {
    throw new AppError("Too many requests, please try again later.", 429);
  },
});

// Stricter rate limit for password operations
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // Limit each IP to 3 password reset requests per hour
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  handler: (req, res, next) => {
    throw new AppError("Too many password reset attempts. Please try again later.", 429);
  },
});

module.exports = limiter;
module.exports.passwordResetLimiter = passwordResetLimiter;

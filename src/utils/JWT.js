// Create a JWT token with user's id  and role

const jwt = require("jsonwebtoken");
const util = require("util");

const jwtSign = util.promisify(jwt.sign);

exports.createToken = async (user) => {
  // Create a JWT token
  const token = await jwtSign({ userId: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
  return token;
};

exports.refreshToken = async (user) => {
  // Create a JWT refresh token
  const refreshToken = await jwtSign({ userId: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return refreshToken;
};

require("dotenv/config");
const connectDB = require("./config/DB");
const { connectRedis } = require("./utils/redisClient");
const app = require("./app");
const logger = require("./config/logger");

const start = async () => {
  // Connect to MongoDB
  await connectDB();

  // Connect to Redis
  await connectRedis();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}...`, {
      environment: process.env.NODE_ENV || "development",
      port,
    });
  });
};

start();

const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info("✅ Connected to MongoDB", {
      host: conn.connection.host,
      database: conn.connection.name,
    });
  } catch (err) {
    logger.error("MongoDB connection error", {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
};

module.exports = connectDB;

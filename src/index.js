require("dotenv/config");
const connectDB = require("./config/DB");
const app = require("./app");
const logger = require("./config/logger");

connectDB();

const port = process.env.PORT || 5000;
app.listen(port, () => {
  logger.info(`Server listening on port ${port}...`, {
    environment: process.env.NODE_ENV || "development",
    port,
  });
});

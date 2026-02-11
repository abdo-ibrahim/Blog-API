const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorHandler");
const generalLimiter = require("./middlewares/rateLimiter");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const { sanitizeMongoInput } = require("express-v5-mongo-sanitize");
const v1Router = require("./routes/v1");
const v2Router = require("./routes/v2");
const logger = require("./config/logger");

const hpp = require("hpp");

const app = express();

// Request logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // Production: log in combined format to winston
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms", {
      stream: logger.stream,
    }),
  );
}

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(sanitizeMongoInput);
app.use(xss());
app.use(hpp());

// General rate limiter: 100 requests per 15 minutes for all routes
app.use(generalLimiter);

// Routes
app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);

app.all("*path", (req, _, next) => {
  const err = new Error(`Can't Find ${req.originalUrl}`);
  err.status = "fail";
  err.statusCode = 404;
  err.isOperational = true;
  next(err);
});

app.use(errorHandler);
module.exports = app;

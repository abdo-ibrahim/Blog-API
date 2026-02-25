const session = require("express-session");
const { RedisStore } = require("connect-redis");
const { redisClient } = require("../utils/redisClient");
const logger = require("./logger");

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "blog:sess:", // key prefix in Redis
  ttl: 60 * 60 * 24, //  1 day (seconds)
});

const sessionMiddleware = session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || "blog-api-secret-change-me",
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create empty sessions
  name: "blog.sid", // custom cookie name (hides tech stack)
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    httpOnly: true, // not accessible via client-side JS
    maxAge: 1000 * 60 * 60 * 24, // 1 day (ms)
    sameSite: "lax",
  },
});

logger.info("Redis session store configured", { prefix: "blog:sess:" });

module.exports = sessionMiddleware;

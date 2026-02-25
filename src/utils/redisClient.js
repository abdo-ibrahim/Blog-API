const { createClient } = require("redis");
const logger = require("../config/logger");

/**
 * Redis Client Singleton
 *
 * Usage:
 *   const redisClient = require('./utils/redisClient');
 *
 *   // String operations
 *   await redisClient.set('key', 'value');
 *   await redisClient.get('key');
 *
 *   // With expiration (seconds)
 *   await redisClient.setEx('key', 3600, 'value');
 *
 *   // JSON helpers
 *   await redisClient.setJSON('key', { foo: 'bar' }, 3600);
 *   const data = await redisClient.getJSON('key');
 *
 *   // Delete / invalidate
 *   await redisClient.del('key');
 *   await redisClient.deleteByPattern('posts:*');
 */

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error("Redis: max reconnection attempts reached");
        return new Error("Redis max reconnection attempts reached");
      }
      const delay = Math.min(retries * 200, 5000);
      logger.warn(`Redis: reconnecting in ${delay}ms (attempt ${retries})`);
      return delay;
    },
  },
});

// Event listeners
redisClient.on("connect", () => {
  logger.info("Redis: client connected");
});

redisClient.on("ready", () => {
  logger.info("Redis: client ready");
});

redisClient.on("error", (err) => {
  logger.error("Redis: client error", { error: err.message });
});

redisClient.on("reconnecting", () => {
  logger.warn("Redis: client reconnecting...");
});

redisClient.on("end", () => {
  logger.info("Redis: client disconnected");
});

// ─── Connect ────────────────────────────────────────────────────────────────
const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info("Redis: successfully connected");
  } catch (err) {
    logger.error("Redis: connection failed", { error: err.message });
    // Don't crash the app – Redis can be optional for caching
  }
};

// ─── JSON Helpers ───────────────────────────────────────────────────────────

/**
 * Store a JSON-serializable value with optional TTL (seconds).
 */
redisClient.setJSON = async (key, value, ttlSeconds) => {
  const json = JSON.stringify(value);
  if (ttlSeconds) {
    await redisClient.setEx(key, ttlSeconds, json);
  } else {
    await redisClient.set(key, json);
  }
};

/**
 * Retrieve and parse a JSON value. Returns null if key doesn't exist.
 */
redisClient.getJSON = async (key) => {
  const data = await redisClient.get(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

/**
 * Delete all keys matching a glob pattern (e.g. "posts:*").
 * Uses SCAN to avoid blocking the server.
 */
redisClient.deleteByPattern = async (pattern) => {
  let cursor = 0;
  let deletedCount = 0;
  do {
    const result = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
    cursor = result.cursor;
    if (result.keys.length) {
      await redisClient.del(result.keys);
      deletedCount += result.keys.length;
    }
  } while (cursor !== 0);

  if (deletedCount > 0) {
    logger.debug(`Redis: deleted ${deletedCount} keys matching "${pattern}"`);
  }
  return deletedCount;
};

module.exports = { redisClient, connectRedis };

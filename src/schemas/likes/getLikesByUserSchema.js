const Joi = require("joi");

const getLikesByUserQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid("createdAt", "updatedAt").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  sort: Joi.string(),
  fields: Joi.string(),
});

const getLikesByUserSchema = {
  query: getLikesByUserQuery,
};
module.exports = getLikesByUserSchema;

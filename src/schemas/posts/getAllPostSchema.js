const Joi = require("joi");

const getAllPostQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid("draft", "published", "scheduled"),
  tags: Joi.string(),
  sortBy: Joi.string().valid("createdAt", "updatedAt", "views", "likes").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  sort: Joi.string(),
  search: Joi.string().trim().max(100),
  q: Joi.string().trim().max(100),
  fields: Joi.string(),
});

const getAllPostSchema = {
  query: getAllPostQuery,
};
module.exports = getAllPostSchema;

const Joi = require("joi");

const getAllUserQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid("createdAt", "updatedAt", "userName", "email").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  sort: Joi.string(),
  search: Joi.string().trim().max(100),
  q: Joi.string().trim().max(100),
  fields: Joi.string(),
});

const getAllUserSchema = {
  query: getAllUserQuery,
};

module.exports = getAllUserSchema;

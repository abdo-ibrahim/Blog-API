const Joi = require("joi");

const getCommentsByPostQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid("createdAt", "updatedAt").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  sort: Joi.string(),
  search: Joi.string().trim().max(100),
  q: Joi.string().trim().max(100),
  fields: Joi.string(),
});
const getCommentsByPostParams = Joi.object({
  postId: Joi.string().hex().length(24).required(),
});
const getCommentsByPostSchema = {
  query: getCommentsByPostQuery,
  params: getCommentsByPostParams,
};
module.exports = getCommentsByPostSchema;

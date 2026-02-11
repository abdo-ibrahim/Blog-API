const Joi = require("joi");

const getCommentByIdQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  fields: Joi.string(),
});
const getCommentByIdParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
const getCommentByIdSchema = {
  query: getCommentByIdQuery,
  params: getCommentByIdParams,
};
module.exports = getCommentByIdSchema;

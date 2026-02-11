const Joi = require("joi");

const getFollowingParams = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});
const getFollowingQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1),
  sort: Joi.string(),
  fields: Joi.string(),
  search: Joi.string(),
});

const getFollowingSchema = {
  params: getFollowingParams,
  query: getFollowingQuery,
};
module.exports = getFollowingSchema;

const Joi = require("joi");

const getFollowersParams = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});
const getFollowersQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1),
  sort: Joi.string(),
  fields: Joi.string(),
  search: Joi.string(),
});

const getFollowersSchema = {
  params: getFollowersParams,
  query: getFollowersQuery,
};
module.exports = getFollowersSchema;

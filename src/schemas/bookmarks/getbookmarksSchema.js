const Joi = require("joi");

const getBookmarksQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1),
  sort: Joi.string(),
  fields: Joi.string(),
  search: Joi.string(),
});
const getBookmarksSchema = {
  query: getBookmarksQuery,
};
module.exports = getBookmarksSchema;

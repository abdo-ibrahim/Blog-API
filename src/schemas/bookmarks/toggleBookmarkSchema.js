const Joi = require("joi");

const toggleBookmarkParams = Joi.object({
  postId: Joi.string().hex().length(24).required(),
});
const toggleBookmarkSchema = {
  params: toggleBookmarkParams,
};
module.exports = toggleBookmarkSchema;

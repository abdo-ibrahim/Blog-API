const Joi = require("joi");

const isBookmarkedParams = Joi.object({
  postId: Joi.string().hex().length(24).required(),
});

const isBookmarkedSchema = {
  params: isBookmarkedParams,
};

module.exports = isBookmarkedSchema;

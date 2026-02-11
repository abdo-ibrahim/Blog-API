const Joi = require("joi");

const isLikedByUserQuery = Joi.object({
  targetType: Joi.string().valid("post", "comment").required(),
  targetId: Joi.string().hex().length(24).required(),
});

const isLikedByUserSchema = {
  query: isLikedByUserQuery,
};
module.exports = isLikedByUserSchema;

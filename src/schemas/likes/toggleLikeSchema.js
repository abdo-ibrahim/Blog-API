const Joi = require("joi");

const toggleLikeBody = Joi.object({
  targetId: Joi.string().hex().length(24).required(),
  targetType: Joi.string().valid("post", "comment").required(),
});

const toggleLikeSchema = {
  body: toggleLikeBody,
};
module.exports = toggleLikeSchema;

const Joi = require("joi");

const getLikeCountQuery = Joi.object({
  targetType: Joi.string().valid("post", "comment").required(),
  targetId: Joi.string().hex().length(24).required(),
});

const getLikeCountSchema = {
  query: getLikeCountQuery,
};
module.exports = getLikeCountSchema;

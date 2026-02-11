const Joi = require("joi");

const toggleFollowParams = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

const toggleFollowSchema = {
  params: toggleFollowParams,
};

module.exports = toggleFollowSchema;

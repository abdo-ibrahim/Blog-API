const Joi = require("joi");

const bookmarkCountParams = Joi.object({
  postId: Joi.string().hex().length(24).required(),
});

const bookmarkCountSchema = {
  params: bookmarkCountParams,
};

module.exports = bookmarkCountSchema;

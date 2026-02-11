const Joi = require("joi");

const publishPostParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
}).unknown(false);

const publishPostSchema = {
  params: publishPostParams,
};

module.exports = publishPostSchema;

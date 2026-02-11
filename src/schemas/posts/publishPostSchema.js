const Joi = require("joi");

const publishPostParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
}).unknown(false);

const publishPostBody = Joi.object({
  publishedAt: Joi.date().optional(),
}).unknown(false);

const publishPostSchema = {
  params: publishPostParams,
  body: publishPostBody,
};

module.exports = publishPostSchema;

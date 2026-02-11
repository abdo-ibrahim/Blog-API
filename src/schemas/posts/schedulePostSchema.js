const Joi = require("joi");

const schedulePostParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
}).unknown(false);

const schedulePostBody = Joi.object({
  publishedAt: Joi.date().greater("now").required(),
}).unknown(false);

const schedulePostSchema = {
  params: schedulePostParams,
  body: schedulePostBody,
};

module.exports = schedulePostSchema;

const Joi = require("joi");

const updatePostBody = Joi.object({
  title: Joi.string().min(3).max(200).trim(),
  content: Joi.string().min(10),
  tags: Joi.array().items(Joi.string().trim()),
  status: Joi.string().valid("draft", "published", "scheduled"),
  publishedAt: Joi.date(),
})
  .unknown(false)
  .min(1);

const updatePostParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updatePostSchema = {
  body: updatePostBody,
  params: updatePostParams,
};
module.exports = updatePostSchema;

const Joi = require("joi");

const createPostBody = Joi.object({
  title: Joi.string().min(3).max(200).trim().required(),
  content: Joi.string().min(10).required(),
  tags: Joi.array().items(Joi.string().trim()),
  status: Joi.string().valid("draft", "published", "scheduled").default("draft"),
  publishedAt: Joi.date().when("status", {
    is: "published",
    then: Joi.date().greater("now").optional(),
    otherwise: Joi.date().optional(),
  }),
}).unknown(false);

const createPostSchema = {
  body: createPostBody,
};
module.exports = createPostSchema;

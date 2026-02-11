const Joi = require("joi");

const updateCommentParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
const updateCommentBody = Joi.object({
  content: Joi.string().min(5).max(1000),
});

const updateCommentSchema = {
  params: updateCommentParams,
  body: updateCommentBody,
};
module.exports = updateCommentSchema;

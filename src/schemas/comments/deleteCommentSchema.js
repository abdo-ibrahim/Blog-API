const Joi = require("joi");

const deleteCommentParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const deleteCommentSchema = {
  params: deleteCommentParams,
};
module.exports = deleteCommentSchema;

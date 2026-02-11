const Joi = require("joi");

const deletePostImageParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
  imageId: Joi.string().required(),
});

const deletePostImageSchema = {
  params: deletePostImageParams,
};

module.exports = deletePostImageSchema;

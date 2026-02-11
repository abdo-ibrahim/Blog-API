const Joi = require("joi");

const uploadPostImagesParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const uploadPostImagesSchema = {
  params: uploadPostImagesParams,
};

module.exports = uploadPostImagesSchema;

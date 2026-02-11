const Joi = require("joi");

const markAsReadParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const markAsReadSchema = {
  params: markAsReadParams,
};

module.exports = markAsReadSchema;

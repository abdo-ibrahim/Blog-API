const Joi = require("joi");

const verifyEmailBody = Joi.object({
  code: Joi.string().length(6).required(),
});

const verifyEmailSchema = {
  body: verifyEmailBody,
};

module.exports = verifyEmailSchema;

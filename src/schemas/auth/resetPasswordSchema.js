const Joi = require("joi");

const resetPasswordBody = Joi.object({
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

const resetPasswordQuery = Joi.object({
  token: Joi.string().required(),
});

const resetPasswordSchema = {
  body: resetPasswordBody,
  query: resetPasswordQuery,
};

module.exports = resetPasswordSchema;

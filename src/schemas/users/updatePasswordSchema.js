const Joi = require("joi");

const updatePasswordBody = Joi.object({
  currentPassword: Joi.string().min(8).max(30).required(),
  newPassword: Joi.string().min(8).max(30).required(),
  confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "confirmNewPassword must match newPassword",
  }),
});

const updatePasswordSchema = {
  body: updatePasswordBody,
};

module.exports = updatePasswordSchema;

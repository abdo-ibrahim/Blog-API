const Joi = require("joi");

const updateUserBody = Joi.object({
  firstName: Joi.string().min(3).max(30),
  lastName: Joi.string().min(3).max(30),
  userName: Joi.string().alphanum().min(3).max(30),
  age: Joi.number().min(18).max(150),
});
const updateUserParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateUserSchema = {
  params: updateUserParams,
  body: updateUserBody,
};

module.exports = updateUserSchema;

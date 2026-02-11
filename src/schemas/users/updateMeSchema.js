const Joi = require("joi");

const updateMeBody = Joi.object({
  userName: Joi.string().alphanum().min(3).max(30),
  firstName: Joi.string().min(2).max(30),
  lastName: Joi.string().min(2).max(30),
  age: Joi.number().min(18).max(150),
});

const updateMeSchema = {
  body: updateMeBody,
};

module.exports = updateMeSchema;

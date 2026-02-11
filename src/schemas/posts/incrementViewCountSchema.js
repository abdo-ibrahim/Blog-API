const Joi = require("joi");

const incrementViewCountParams = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const incrementViewCountSchema = {
  params: incrementViewCountParams,
};
module.exports = incrementViewCountSchema;

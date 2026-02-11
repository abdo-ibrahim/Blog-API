const Joi = require("joi");
const getUserNotificationsQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const getUserNotificationsSchema = {
  query: getUserNotificationsQuery,
};

module.exports = getUserNotificationsSchema;

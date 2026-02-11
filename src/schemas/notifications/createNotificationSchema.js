const Joi = require("joi");

const createNotificationBody = Joi.object({
  recipient: Joi.string().hex().length(24).required(),
  sender: Joi.string().hex().length(24).required(),
  type: Joi.string().valid("like", "comment", "follow", "reply").required(),
  relatedPostId: Joi.string().hex().length(24),
  relatedCommentId: Joi.string().hex().length(24),
});

const createNotificationSchema = {
  body: createNotificationBody,
};

module.exports = createNotificationSchema;

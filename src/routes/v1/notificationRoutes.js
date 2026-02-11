const express = require("express");
const router = express.Router();

const { validate } = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authenticate");
const { notifications: notificationSchema } = require("../../schemas");

const { createNotification, getUserNotifications, markAsRead, markAllAsRead } = require("../../controllers/notificationController");

router.post("/", authenticate, validate(notificationSchema.createNotification), createNotification);

router.get("/", authenticate, validate(notificationSchema.getUserNotifications), getUserNotifications);

router.patch("/read-all", authenticate, validate(notificationSchema.markAllAsRead), markAllAsRead);

router.patch("/:id/read", authenticate, validate(notificationSchema.markAsRead), markAsRead);

module.exports = router;

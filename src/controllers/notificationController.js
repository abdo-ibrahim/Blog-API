const notificationService = require("../services/notificationService");

/**
 * @desc Create a notification
 * @route POST /notifications
 * @method POST
 * @access Private
 */
exports.createNotification = async (req, res, next) => {
  const notificationData = req.body;
  const notification = await notificationService.createNotification(notificationData);
  res.status(201).json({
    message: "Notification created successfully",
    data: notification,
  });
};

/**
 * @desc Get user notifications with pagination
 * @route GET /notifications
 *  @method GET
 * @access Private
 */

exports.getUserNotifications = async (req, res, next) => {
  const userId = req.user._id;
  const notifications = await notificationService.getUserNotifications(userId, req.query);
  res.status(200).json({
    message: "User notifications retrieved successfully",
    data: notifications,
  });
};

/**
 * @desc Mark a notification as read
 * @route PATCH /notifications/:id/read
 * @method PATCH
 * @access Private
 */
exports.markAsRead = async (req, res, next) => {
  const notificationId = req.params.id;
  const notification = await notificationService.markAsRead(notificationId);
  res.status(200).json({
    message: "Notification marked as read",
    data: notification,
  });
};

/**
 * @desc Mark all notifications as read for a user
 * @route PATCH /notifications/read-all
 * @method PATCH
 * @access Private
 */
exports.markAllAsRead = async (req, res, next) => {
  const userId = req.user._id;
  const result = await notificationService.markAllAsRead(userId);
  res.status(200).json({
    message: "All notifications marked as read",
    data: result,
  });
};

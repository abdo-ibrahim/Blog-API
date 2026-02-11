const Notification = require("../models/notificationModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Comment = require("../models/commentModel");
const AppError = require("../utils/appErrors");
const APIFeatures = require("../utils/APIFeatures");

class NotificationService {
  // create a notification
  static async createNotification(notificationData) {
    const notification = await Notification.create(notificationData);

    return notification;
  }

  // Get user notifications with pagination
  static async getUserNotifications(userId, query) {
    const features = new APIFeatures(Notification.find({ recipient: userId }).sort({ createdAt: -1 }), query).paginate().limitFields("-__v");

    const notifications = await features.query;

    const totalQuery = new APIFeatures(Notification.find({ recipient: userId }), query).paginate().limitFields("-__v");
    const total = await totalQuery.query.countDocuments();
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  // Mark a notification as read
  static async markAsRead(notificationId) {
    const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    return notification;
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      { isRead: true },
    );
    return result;
  }
}

module.exports = NotificationService;

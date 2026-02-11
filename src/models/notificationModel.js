const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow", "reply"],
      required: true,
    },
    relatedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    relatedCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// ===== INDEXES =====
// Indexes for recipient queries (primary access pattern)
notificationSchema.index({ recipient: 1 }); // Find all notifications for a user
notificationSchema.index({ recipient: 1, isRead: 1 }); // Find read/unread notifications
notificationSchema.index({ recipient: 1, createdAt: -1 }); // User's notifications sorted by date

// Indexes for filtering by type
notificationSchema.index({ type: 1 }); // Find notifications by type
notificationSchema.index({ recipient: 1, type: 1 }); // User's notifications by type

// Indexes for sender (for notification context)
notificationSchema.index({ sender: 1 }); // Find notifications from a user

// Indexes for related resources
notificationSchema.index({ relatedPostId: 1 }, { sparse: true }); // Find notifications for a post
notificationSchema.index({ relatedCommentId: 1 }, { sparse: true }); // Find notifications for a comment

// Compound index for unread notifications (common query)
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 }); // Unread notifications sorted by date

const Notification = mongoose.model("notifications", notificationSchema);

module.exports = Notification;

const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true },
);

// ===== INDEXES =====
// Unique compound index to prevent duplicate bookmarks
bookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

// Single field indexes for queries
bookmarkSchema.index({ userId: 1 }); // Find all bookmarks by a user
bookmarkSchema.index({ postId: 1 }); // Find how many users bookmarked a post

// Compound indexes for common queries
bookmarkSchema.index({ userId: 1, createdAt: -1 }); // User's bookmarks sorted by date

const Bookmark = mongoose.model("bookmarks", bookmarkSchema);

module.exports = Bookmark;

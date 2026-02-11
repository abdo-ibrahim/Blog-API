const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  targetType: {
    type: String,
    enum: ["post", "comment"],
    required: true,
  },
});

// ===== INDEXES =====
// Unique compound index to prevent duplicate likes
likeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

// Single field indexes for queries
likeSchema.index({ userId: 1 }); // Find all likes by a user
likeSchema.index({ targetId: 1, targetType: 1 }); // Find all likes on a specific target
likeSchema.index({ targetType: 1 }); // Find likes by type (post or comment)

const Like = mongoose.model("likes", likeSchema);

module.exports = Like;

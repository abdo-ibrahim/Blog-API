const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// ===== INDEXES =====
// Unique compound index to prevent duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Single field indexes for queries
followSchema.index({ follower: 1 }); // Find who a user is following
followSchema.index({ following: 1 }); // Find followers of a user

// Indexes for counts and sorting
followSchema.index({ createdAt: -1 }); // For sorting recent follows

followSchema.pre("save", function () {
  if (this.follower.toString() === this.following.toString()) {
    const error = new Error("You cannot follow yourself");
    error.statusCode = 400;
    throw error;
  }
});

const Follow = mongoose.model("follows", followSchema);

module.exports = Follow;

const mongoose = require("mongoose");
const User = require("./userModel");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    author: {
      type: String,
      required: true,
    },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    images: [
      {
        fileId: String,
        imagePath: String,
        _id: false,
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

postSchema.virtual("likedBy", {
  ref: "likes",
  localField: "_id",
  foreignField: "targetId",
  justOne: false,
  match: { targetType: "post" },
});

postSchema.virtual("likesCount").get(function () {
  return this.likes;
});

postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

// ===== INDEXES =====
// Single field indexes
postSchema.index({ userId: 1 }); // For finding posts by user
postSchema.index({ status: 1 }); // For filtering by status (draft/published/scheduled)
postSchema.index({ createdAt: -1 }); // For sorting by creation date
postSchema.index({ publishedAt: -1 }, { sparse: true }); // For sorting published posts

// Indexes for search
postSchema.index({ title: "text", content: "text", tags: "text" }); // Full-text search

// Compound indexes for common query patterns
postSchema.index({ userId: 1, status: 1 }); // User's posts by status
postSchema.index({ status: 1, createdAt: -1 }); // Published posts sorted by date
postSchema.index({ userId: 1, createdAt: -1 }); // User's posts sorted by date

// View count index for sorting by popularity
postSchema.index({ views: -1 }); // For finding trending posts
postSchema.index({ likes: -1 }); // For finding most liked posts

// Date range queries
postSchema.index({ createdAt: 1, userId: 1 }); // For date range + user queries

const Post = mongoose.model("Post", postSchema);

module.exports = Post;

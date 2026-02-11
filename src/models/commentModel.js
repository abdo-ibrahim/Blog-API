const mongoose = require("mongoose");
const User = require("./userModel");
const Post = require("./postModel");
const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1000,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
      default: null,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

commentSchema.virtual("likedBy", {
  ref: "likes",
  localField: "_id",
  foreignField: "targetId",
  justOne: false,
  match: { targetType: "comment" },
});

commentSchema.virtual("likesCount").get(function () {
  return this.likes;
});

// ===== INDEXES =====
// Single field indexes for foreign keys
commentSchema.index({ postId: 1 }); // For finding comments on a post
commentSchema.index({ userId: 1 }); // For finding comments by a user
commentSchema.index({ parentCommentId: 1 }, { sparse: true }); // For finding replies to a comment

// Compound indexes for common queries
commentSchema.index({ postId: 1, createdAt: -1 }); // Comments on a post sorted by date
commentSchema.index({ userId: 1, createdAt: -1 }); // User's comments sorted by date
commentSchema.index({ postId: 1, parentCommentId: 1 }); // Replies to comments on a post

// Indexes for sorting and filtering
commentSchema.index({ createdAt: -1 }); // For sorting latest comments
commentSchema.index({ likes: -1 }); // For finding most liked comments
commentSchema.index({ isEdited: 1 }); // For filtering edited comments

commentSchema.set("toJSON", { virtuals: true });
commentSchema.set("toObject", { virtuals: true });

const Comment = mongoose.model("comments", commentSchema);

module.exports = Comment;

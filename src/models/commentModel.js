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

commentSchema.set("toJSON", { virtuals: true });
commentSchema.set("toObject", { virtuals: true });

const Comment = mongoose.model("comments", commentSchema);

module.exports = Comment;

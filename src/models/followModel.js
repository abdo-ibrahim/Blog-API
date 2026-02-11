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

followSchema.index({ follower: 1, following: 1 }, { unique: true });

followSchema.pre("save", function () {
  if (this.follower.toString() === this.following.toString()) {
    const error = new Error("You cannot follow yourself");
    error.statusCode = 400;
    throw error;
  }
});

const Follow = mongoose.model("follows", followSchema);

module.exports = Follow;

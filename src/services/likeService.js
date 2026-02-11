const Like = require("../models/likesModel");
const AppError = require("../utils/appErrors");
const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const APIFeatures = require("../utils/APIFeatures");

class LikeService {
  // toggle like on a post or comment
  static async toggleLike(targetType, targetId, userId) {
    let target;
    if (targetType === "post") {
      target = await Post.findById(targetId);
    } else if (targetType === "comment") {
      target = await Comment.findById(targetId);
    }
    if (!target) {
      throw new AppError(`${targetType.charAt(0).toUpperCase() + targetType.slice(1)} not found`, 404);
    }

    // Check if user already liked the target
    const existingLike = await Like.findOne({ targetType, targetId, userId });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
      if (targetType === "post") {
        await Post.findByIdAndUpdate(targetId, { $inc: { likes: -1 } }, { runValidators: false });
      } else if (targetType === "comment") {
        await Comment.findByIdAndUpdate(targetId, { $inc: { likes: -1 } }, { runValidators: false });
      }
      return { liked: false };
    } else {
      // Like
      await Like.create({ targetType, targetId, userId });
      if (targetType === "post") {
        await Post.findByIdAndUpdate(targetId, { $inc: { likes: 1 } }, { runValidators: false });
      } else if (targetType === "comment") {
        await Comment.findByIdAndUpdate(targetId, { $inc: { likes: 1 } }, { runValidators: false });
      }
      return { liked: true };
    }
  }

  // get like count for a post or comment
  static async getLikeCount(targetType, targetId) {
    let target;
    if (targetType === "post") {
      target = await Post.findById(targetId);
    } else if (targetType === "comment") {
      target = await Comment.findById(targetId);
    }
    if (!target) {
      throw new AppError(`${targetType.charAt(0).toUpperCase() + targetType.slice(1)} not found`, 404);
    }
    return target.likes;
  }

  // check if user liked a post or comment
  static async isLikedByUser(targetType, targetId, userId) {
    const existingLike = await Like.findOne({ targetType, targetId, userId });
    return !!existingLike;
  }
  // get all likes by a user
  static async getLikesByUser(userId, query) {
    const features = new APIFeatures(Like.find({ userId }), query).filter().sort().limitFields().paginate();

    let likes = await features.query
      .populate({
        path: "userId",
        select: "firstName lastName userName profilePicture",
      })
      .lean();

    // Populate targetId based on targetType (post or comment)
    likes = await Promise.all(
      likes.map(async (like) => {
        if (like.targetType === "post") {
          like.targetId = await Post.findById(like.targetId)
            .select("_id title content author")
            .lean();
        } else if (like.targetType === "comment") {
          like.targetId = await Comment.findById(like.targetId)
            .select("_id content postId userId")
            .lean();
        }
        return like;
      })
    );

    const totalLikes = await Like.countDocuments({ userId });
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;

    return {
      likes,
      pagination: {
        page,
        limit,
        totalLikes,
      },
    };
  }
}

module.exports = LikeService;

const Bookmark = require("../models/bookmarkModel");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const APIFeatures = require("../utils/APIFeatures");

const AppError = require("../utils/appErrors");

class BookmarkService {
  // Toggle bookmark for a post
  static async toggleBookmark(userId, postId) {
    const existingBookmark = await Bookmark.findOne({ userId, postId });
    if (existingBookmark) {
      await Bookmark.findByIdAndDelete(existingBookmark._id);
    } else {
      await Bookmark.create({ userId, postId });
    }
    return { bookmarked: !existingBookmark };
  }
  // Get bookmarks of a user
  static async getUserBookmarks(userId, query) {
    const features = new APIFeatures(
      Bookmark.find({ userId }).populate({
        path: "postId",
        select: "title content author images likes views createdAt userId",
        populate: {
          path: "userId",
          select: "firstName lastName userName profilePicture",
        },
      }),
      query,
    )
      .filter()
      .search(["postId.title", "postId.content"])
      .sort()
      .paginate()
      .limitFields();

    const bookmarks = await features.query.lean().exec();

    const total = await Bookmark.countDocuments({ userId });
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    return {
      bookmarks,
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

  // Check if post is bookmarked
  static async isBookmarked(userId, postId) {
    const bookmark = await Bookmark.findOne({ userId, postId });
    return { bookmarked: !!bookmark };
  }

  // Get bookmark count for a post
  static async getBookmarkCount(postId) {
    const count = await Bookmark.countDocuments({ postId });
    return count;
  }
}

module.exports = BookmarkService;

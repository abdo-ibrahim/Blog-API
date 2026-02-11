const bookmarkService = require("../services/bookmarkService");

/**
 * @desc Toggle bookmark/unbookmark a post
 * @route POST /posts/:postId/bookmark
 * @method POST
 * @access Private
 */
exports.toggleBookmark = async (req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.postId;
  const result = await bookmarkService.toggleBookmark(userId, postId);
  res.status(200).json({
    message: result.bookmarked ? "Bookmarked successfully" : "Unbookmarked successfully",
    data: result,
  });
};

/**
 * @desc Get bookmarks of a user
 * @route GET /users/bookmarks
 * @method GET
 * @access Private
 */
exports.getUserBookmarks = async (req, res, next) => {
  const userId = req.user._id;
  const bookmarks = await bookmarkService.getUserBookmarks(userId, req.query);
  res.status(200).json({
    message: "Bookmarks fetched successfully",
    data: bookmarks,
  });
};

/**
 * @desc Check if a post is bookmarked by user
 * @route GET /posts/:postId/isBookmarked
 * @method GET
 * @access Private
 */
exports.isBookmarked = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;
    const result = await bookmarkService.isBookmarked(userId, postId);
    res.status(200).json({
      message: "Bookmark status fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get bookmark count for a post
 * @route GET /posts/:postId/bookmarkCount
 * @method GET
 * @access Public
 */
exports.getBookmarkCount = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const count = await bookmarkService.getBookmarkCount(postId);
    res.status(200).json({
      message: "Bookmark count fetched successfully",
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

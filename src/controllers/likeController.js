const likeService = require("../services/likeService");

/**
 * @desc Toggle like on a post or comment
 * @route POST /likes/toggle
 * @method POST
 * @access Private
 */
exports.toggleLike = async (req, res, next) => {
  const { targetType, targetId } = req.body;
  const userId = req.user._id;
  const result = await likeService.toggleLike(targetType, targetId, userId);
  res.status(200).json({
    message: result.liked ? "Liked successfully" : "Unliked successfully",
    data: result,
  });
};

/**
 * @desc Get like count for a post or comment
 * @route GET /likes/count
 * @method GET
 * @access Private
 */
exports.getLikeCount = async (req, res, next) => {
  const { targetType, targetId } = req.query;
  const likeCount = await likeService.getLikeCount(targetType, targetId);
  res.status(200).json({
    data: { likeCount },
  });
};

/**
 * @desc Check if user liked a post or comment
 * @route GET /likes/check
 * @method GET
 * @access Private
 */
exports.isLikedByUser = async (req, res, next) => {
  const { targetType, targetId } = req.query;
  const userId = req.user._id;
  const isLiked = await likeService.isLikedByUser(targetType, targetId, userId);
  res.status(200).json({
    data: { isLiked },
  });
};

/**
 * @desc get all likes by a user
 *  @route GET /users/:userId/likes
 * @method GET
 * @access Private
 */
exports.getLikesByUser = async (req, res, next) => {
  const userId = req.user._id;
  const queryParams = req.query;
  const result = await likeService.getLikesByUser(userId, queryParams);
  res.status(200).json({
    message: "Likes fetched successfully",
    data: result.likes,
    pagination: result.pagination,
  });
};

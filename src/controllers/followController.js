const followService = require("../services/followService");

/**
 * @desc Toggle follow/unfollow a user
 * @route POST /users/:userId/follow
 * @method POST
 * @access Private
 */
exports.toggleFollow = async (req, res, next) => {
  const follower = req.user._id;
  const following = req.params.userId;
  const result = await followService.toggleFollow(follower, following);
  res.status(200).json({
    message: result.following ? "Followed successfully" : "Unfollowed successfully",
    data: result,
  });
};

/**
 * @desc Get followers of a user
 * @route GET /users/:userId/followers
 * @method GET
 */
exports.getFollowers = async (req, res, next) => {
  const userId = req.params.userId;
  const followers = await followService.getFollowers(userId, req.query);
  res.status(200).json({
    message: "Followers fetched successfully",
    data: followers,
  });
};

/**
 * @desc Get following of a user
 * @route GET /users/:userId/following
 * @method GET
 */
exports.getFollowing = async (req, res, next) => {
  const userId = req.params.userId;
  const following = await followService.getFollowing(userId, req.query);
  res.status(200).json({
    message: "Following fetched successfully",
    data: following,
  });
};

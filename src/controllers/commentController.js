const commentService = require("../services/commentService");

/**
 * @desc    Create a new comment or reply
 * @route   POST /comments
 * @method  POST
 * @access  Private
 */
exports.createComment = async (req, res) => {
  const userId = req.user._id;
  const comment = await commentService.createComment(req.body, userId);
  res.status(201).json({ message: "Comment created successfully", data: comment });
};

/**
 * @desc    Search and filter comments (advanced)
 * @route   GET /comments
 * @method  GET
 * @access  Private
 */
exports.getAllComments = async (req, res) => {
  const userId = req.user._id;
  const result = await commentService.getAllComments(req.query, userId);
  res.status(200).json({
    message: "Comments fetched successfully",
    data: result.comments,
    pagination: result.pagination,
  });
};
/**
 * @desc    Get all comments for a specific post
 * @route   GET /posts/:postId/comments
 * @method  GET
 * @access  Private
 */
exports.getCommentsByPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const result = await commentService.getCommentsByPost(postId, userId, req.query);
  res.status(200).json({
    message: "Comments fetched successfully",
    data: result.comments,
    pagination: result.pagination,
  });
};
/**
 * @desc    Get comment by ID
 * @route   GET /comments/:id
 * @method  GET
 * @access  Private
 */

exports.getCommentById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const comment = await commentService.getCommentById(id, userId);

  res.status(200).json({
    message: "Comment fetched successfully",
    data: comment,
  });
};

/**
 * @desc    Update comment by ID
 * @route   PATCH /comments/:id
 * @method  PATCH
 * @access  Private
 */
exports.updateComment = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updatedComment = await commentService.updateCommentById(id, req.body, userId);
  res.status(200).json({ message: "Comment updated successfully", data: updatedComment });
};

/**
 * @desc    Delete comment by ID
 * @route   DELETE /comments/:id
 * @method  DELETE
 * @access  Private
 */
exports.deleteComment = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  await commentService.deleteCommentById(id, userId);
  res.status(200).json({ message: "Comment deleted successfully" });
};

/** * @desc    Get replies for a specific comment
 * @route   GET /comments/:id/replies
 * @method  GET
 * @access  Private
 */
exports.getCommentReplies = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const replies = await commentService.getCommentReplies(id, userId);
  res.status(200).json({
    message: "Replies fetched successfully",
    data: replies,
  });
};

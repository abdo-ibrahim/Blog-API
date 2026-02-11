const PostService = require("../services/postService");

/**
 * @desc    Create a new post
 * @route   POST /posts
 * @method  POST
 * @access  Private
 */
exports.createPost = async (req, res) => {
  const userId = req.user._id;
  const author = req.user.fullName;
  const post = await PostService.createPost(req.body, userId, author);
  res.status(201).json({ message: "Post created successfully", data: post });
};

/**
 * @desc    Get all posts
 * @route   GET /posts
 * @method  GET
 * @access  Private
 */
exports.getAllPosts = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;
  const queryParams = req.query;

  let result;
  if (role === "admin") {
    result = await PostService.getAllPostsAdmin(queryParams);
  } else {
    result = await PostService.getAllPosts(queryParams, userId, role);
  }

  res.status(200).json({
    message: "Posts fetched successfully",
    data: result.posts,
    pagination: result.pagination,
  });
};

/**
 * @desc    Get post by ID
 * @route   GET /posts/:id
 * @method  GET
 * @access  Private
 */
exports.getPostById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const post = await PostService.getPostById(id, userId);
  res.status(200).json({ message: "Post fetched successfully", data: post });
};

/**
 * @desc    Update post by ID
 * @route   PATCH /posts/:id
 * @method  PATCH
 * @access  Private
 */
exports.updatePost = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const role = req.user.role;
  const updatedPost = await PostService.updatePost(id, req.body, userId, role);
  res.status(200).json({
    message: "Post updated successfully",
    data: updatedPost,
  });
};

/**
 * @desc    Delete post by ID
 * @route   DELETE /posts/:id
 * @method  DELETE
 * @access  Private
 */
exports.deletePost = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const role = req.user.role;
  const deletedPost = await PostService.deletePost(id, userId, role);
  res.status(200).json({
    message: "Post deleted successfully",
    data: deletedPost,
  });
};
/**
 * @desc    Publish a post
 * @route   PATCH /posts/:id/publish
 * @method  PATCH
 * @access  Private (Owner or Admin)
 */
exports.publishPost = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const role = req.user.role;
  const publishedPost = await PostService.publishPost(id, userId, role);
  res.status(200).json({
    message: "Post published successfully",
    data: publishedPost,
  });
};

/**
 * @desc    Unpublish a post
 * @route   PATCH /posts/:id/draft
 * @method  PATCH
 * @access  Private (Owner or Admin)
 */
exports.draftPost = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const role = req.user.role;
  const draftedPost = await PostService.draftPost(id, userId, role);
  res.status(200).json({
    message: "Post drafted successfully",
    data: draftedPost,
  });
};

/**
 * @desc    Schedule a post
 * @route   PATCH /posts/:id/schedule
 * @method  PATCH
 * @access  Private (Owner or Admin)
 */
exports.schedulePost = async (req, res, next) => {
  const { id } = req.params;
  const { publishedAt } = req.body;
  const userId = req.user._id;
  const role = req.user.role;
  const scheduledPost = await PostService.schedulePost(id, new Date(publishedAt), userId, role);
  res.status(200).json({
    message: "Post scheduled successfully",
    data: scheduledPost,
  });
};

/**
 * @desc  Increment View count (public or auth)
 * @route POST /posts/:id/view
 * @method POST
 * @access Public
 */

exports.incrementViewCount = async (req, res, next) => {
  const { id } = req.params;
  const updatedPost = await PostService.incrementViewCount(id);
  res.status(200).json({
    message: "Post view count incremented successfully",
    data: updatedPost,
  });
};

/**
 * @desc    Get my posts
 * @route   GET /posts/my-posts
 * @method  GET
 * @access  Private (User)
 */
exports.getMyPosts = async (req, res, next) => {
  const userId = req.user._id;
  const queryParams = req.query;

  const result = await PostService.getMyPosts(userId, queryParams);

  res.status(200).json({
    message: "My posts fetched successfully",
    data: result.posts,
    pagination: result.pagination,
  });
};

/**
 * @desc  Upload images for a post
 * @route POST /posts/:id/images
 * @method POST
 * @access Private
 */
exports.uploadPostImages = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const role = req.user.role;
  const updatedPost = await PostService.uploadPostImages(id, req.files, userId, role);
  res.status(200).json({
    message: "Post images uploaded successfully",
    data: updatedPost,
  });
};

/**
 * @desc  Delete an image from a post
 * @route DELETE /posts/:postId/images/:imageId
 * @method DELETE
 * @access Private
 */
exports.deletePostImage = async (req, res, next) => {
  const { id, imageId } = req.params;
  const userId = req.user._id;
  const role = req.user.role;
  const updatedPost = await PostService.deletePostImage(id, imageId, userId, role);
  res.status(200).json({
    message: "Post image deleted successfully",
    data: updatedPost,
  });
};

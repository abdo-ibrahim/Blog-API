module.exports = {
  createPost: require("./createPostSchema"),
  deletePost: require("./deletePostSchema"),
  getAllPost: require("./getAllPostSchema"),
  getPostById: require("./getPostByIdSchema"),
  updatePost: require("./updatePostSchema"),
  publishPost: require("./publishPostSchema"),
  schedulePost: require("./schedulePostSchema"),
  draftPost: require("./draftPostSchema"),
  getMyPosts: require("./getMyPostsSchema"),
  uploadPostImages: require("./uploadPostImagesSchema"),
  deletePostImage: require("./deletePostImageSchema"),
  incrementViewCount: require("./incrementViewCountSchema"),
};

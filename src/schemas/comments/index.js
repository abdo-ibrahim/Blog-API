module.exports = {
  createComment: require("./createCommentSchema"),
  deleteComment: require("./deleteCommentSchema"),
  getAllComments: require("./getAllCommentsSchema"),
  getCommentById: require("./getCommentByIdSchema"),
  updateComment: require("./updateCommentSchema"),
  getCommentsByPost: require("./getCommentsByPostSchema"),
};
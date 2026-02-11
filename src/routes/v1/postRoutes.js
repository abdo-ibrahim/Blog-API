const express = require("express");
const router = express.Router();
const { createPost, getAllPosts, getPostById, updatePost, deletePost, getMyPosts, schedulePost, draftPost, publishPost, deletePostImage, uploadPostImages, incrementViewCount } = require("../../controllers/postController");

const { toggleBookmark } = require("../../controllers/bookmarkController");

const { getCommentsByPost } = require("../../controllers/commentController");
const { validate } = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authenticate");
const { posts: postSchema } = require("../../schemas");
const { comments: commentSchema } = require("../../schemas");
const { bookmarks: bookmarkSchema } = require("../../schemas");
const { uploadPostImages: uploadPostImagesMiddleware } = require("../../config/fileUpload");
const { fileUploadLimiter } = require("../../middlewares/rateLimiter");

// Post routes
router.post("/", authenticate, validate(postSchema.createPost), createPost);
router.get("/", authenticate, validate(postSchema.getAllPost), getAllPosts);
router.get("/my-posts", authenticate, validate(postSchema.getMyPosts), getMyPosts);
router.get("/:id", authenticate, validate(postSchema.getPostById), getPostById);
router.post("/:id/view", validate(postSchema.incrementViewCount), incrementViewCount);
router.patch("/:id/schedule", authenticate, validate(postSchema.schedulePost), schedulePost);
router.patch("/:id/draft", authenticate, validate(postSchema.draftPost), draftPost);
router.patch("/:id/publish", authenticate, validate(postSchema.publishPost), publishPost);
router.patch("/:id", authenticate, validate(postSchema.updatePost), updatePost);
router.delete("/:id", authenticate, validate(postSchema.deletePost), deletePost);

router.post("/:postId/bookmark", authenticate, validate(bookmarkSchema.toggleBookmark), toggleBookmark);

router.post("/:id/images", authenticate, fileUploadLimiter, validate(postSchema.uploadPostImages), uploadPostImagesMiddleware, uploadPostImages);

router.delete("/:id/images/:imageId", authenticate, validate(postSchema.deletePostImage), deletePostImage);
// Comment routes
router.get("/:postId/comments", authenticate, validate(commentSchema.getCommentsByPost), getCommentsByPost);

module.exports = router;

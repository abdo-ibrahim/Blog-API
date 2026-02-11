const express = require("express");
const router = express.Router();
const { createComment, getAllComments, getCommentById, updateComment, deleteComment, getCommentReplies } = require("../../controllers/commentController");
const { validate } = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authenticate");
const { comments: commentSchema } = require("../../schemas");

router.post("/", authenticate, validate(commentSchema.createComment), createComment);

router.get("/", authenticate, validate(commentSchema.getAllComments), getAllComments);
router.get("/:id", authenticate, validate(commentSchema.getCommentById), getCommentById);
router.get("/:id/replies", authenticate, getCommentReplies);

router.patch("/:id", authenticate, validate(commentSchema.updateComment), updateComment);

router.delete("/:id", authenticate, validate(commentSchema.deleteComment), deleteComment);

module.exports = router;

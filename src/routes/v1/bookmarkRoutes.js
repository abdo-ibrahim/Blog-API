const express = require("express");
const router = express.Router();

const { validate } = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authenticate");
const { bookmarks: bookmarkSchema } = require("../../schemas");

const { toggleBookmark, getUserBookmarks, isBookmarked, getBookmarkCount } = require("../../controllers/bookmarkController");

router.post("/:postId/bookmark", authenticate, validate(bookmarkSchema.toggleBookmark), toggleBookmark);

router.get("/:postId/isBookmarked", authenticate, validate(bookmarkSchema.isBookmarked), isBookmarked);

router.get("/:postId/bookmarkCount", validate(bookmarkSchema.bookmarkCount), getBookmarkCount);

module.exports = router;

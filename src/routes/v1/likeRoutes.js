const express = require("express");
const router = express.Router();
const { toggleLike, getLikeCount, isLikedByUser } = require("../../controllers/likeController");
const { validate } = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authenticate");
const { likes: likeSchema } = require("../../schemas");

router.post("/toggle", authenticate, validate(likeSchema.toggleLike), toggleLike);

router.get("/count", authenticate, validate(likeSchema.getLikeCount), getLikeCount);

router.get("/check", authenticate, validate(likeSchema.isLikedByUser), isLikedByUser);

module.exports = router;

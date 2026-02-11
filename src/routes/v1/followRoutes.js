const express = require("express");
const router = express.Router();

const { validate } = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authenticate");
const { follows: followSchema } = require("../../schemas");

const { toggleFollow, getFollowers, getFollowing } = require("../../controllers/followController");

router.post("/:userId/follow", authenticate, validate(followSchema.toggleFollow), toggleFollow);

router.get("/:userId/followers", authenticate, validate(followSchema.getFollowers), getFollowers);

router.get("/:userId/following", authenticate, validate(followSchema.getFollowing), getFollowing);

module.exports = router;

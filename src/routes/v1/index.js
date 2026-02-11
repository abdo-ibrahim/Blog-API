const express = require("express");

const router = express.Router();

const authRouter = require("./authRoutes");
const userRouter = require("./userRoutes");
const postRouter = require("./postRoutes");
const donationRouter = require("./donationRoutes");
const commentRouter = require("./commentRoutes");
const likeRouter = require("./likeRoutes");
const followRouter = require("./followRoutes");
const bookmarkRouter = require("./bookmarkRoutes");
const notificationRouter = require("./notificationRoutes");

router.use(`/auth`, authRouter);
router.use(`/users`, userRouter);
router.use(`/posts`, postRouter);
router.use(`/donation`, donationRouter);
router.use(`/comments`, commentRouter);
router.use(`/likes`, likeRouter);
router.use(`/users`, followRouter);
router.use(`/posts`, bookmarkRouter);
router.use(`/notifications`, notificationRouter);

module.exports = router;

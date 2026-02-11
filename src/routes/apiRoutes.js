const express = require("express");

const router = express.Router();
const baseURL = "/api/v1";

const authRouter = require("./api/authRoutes");
const userRouter = require("./api/userRoutes");
const postRouter = require("./api/postRoutes");
const donationRouter = require("./api/donationRoutes");
const commentRouter = require("./api/commentRoutes");
const likeRouter = require("./api/likeRoutes");
const followRouter = require("./api/followRoutes");
const bookmarkRouter = require("./api/bookmarkRoutes");
const notificationRouter = require("./api/notificationRoutes");

router.use(`${baseURL}/auth`, authRouter);
router.use(`${baseURL}/users`, userRouter);
router.use(`${baseURL}/posts`, postRouter);
router.use(`${baseURL}/donation`, donationRouter);
router.use(`${baseURL}/comments`, commentRouter);
router.use(`${baseURL}/likes`, likeRouter);
router.use(`${baseURL}/users`, followRouter);
router.use(`${baseURL}/posts`, bookmarkRouter);
router.use(`${baseURL}/notifications`, notificationRouter);

module.exports = router;

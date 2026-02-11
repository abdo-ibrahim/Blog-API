const express = require("express");

const router = express.Router();

const postRouter = require("./postRoutes");

router.use(`/posts`, postRouter);

module.exports = router;

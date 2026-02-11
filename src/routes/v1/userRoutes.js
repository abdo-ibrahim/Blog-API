const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, updateProfilePicture, deleteProfilePicture, getMe, updateMe, updatePassword } = require("../../controllers/userController");

const { getUserBookmarks } = require("../../controllers/bookmarkController");

const { getLikesByUser } = require("../../controllers/likeController");
const { validate } = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authenticate");
const allowTo = require("../../middlewares/allowTo");
const { users: userSchema } = require("../../schemas");
const { likes: likeSchema } = require("../../schemas");
const { bookmarks: bookmarkSchema } = require("../../schemas");
const { uploadProfilePicture } = require("../../config/fileUpload");
const { fileUploadLimiter } = require("../../middlewares/rateLimiter");

router.get("/", authenticate, allowTo("admin"), validate(userSchema.getAllUsers), getAllUsers);
router.get("/me", authenticate, getMe);
router.get("/bookmarks", authenticate, validate(bookmarkSchema.getBookmarks), getUserBookmarks);
router.patch("/me", authenticate, validate(userSchema.updateMe), updateMe);

router.patch("/update-password", authenticate, validate(userSchema.updatePassword), updatePassword);
router.get("/:id", authenticate, allowTo("admin"), validate(userSchema.getUserById), getUserById);
router.patch("/profile-picture", authenticate, fileUploadLimiter, uploadProfilePicture, updateProfilePicture);

router.delete("/profile-picture", authenticate, deleteProfilePicture);

router.patch("/:id", authenticate, allowTo("admin"), validate(userSchema.updateUser), updateUser);
router.delete("/:id", authenticate, allowTo("admin"), validate(userSchema.deleteUser), deleteUser);

// get all likes by a user
router.get("/:userId/likes", authenticate, validate(likeSchema.getLikesByUser), getLikesByUser);

module.exports = router;

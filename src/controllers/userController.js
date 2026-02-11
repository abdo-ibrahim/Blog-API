const userService = require("../services/userService");

/**
 * @desc    Get all users
 * @route   GET /users
 * @method  GET
 * @access  Private
 */
exports.getAllUsers = async (req, res, next) => {
  const result = await userService.getAllUsers(req.query);
  res.status(200).json({
    message: "Users fetched successfully",
    data: result.users,
    pagination: result.pagination,
  });
};

/**
 * @desc    Get user by ID
 * @route   GET /users/:id
 * @method  GET
 * @access  Private
 */
exports.getUserById = async (req, res, next) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  res.status(200).json({
    message: "User fetched successfully",
    data: user,
  });
};

/**
 * @desc    Update user by ID
 * @route   PATCH /users/:id
 * @method  PATCH
 * @access  Private
 */
exports.updateUser = async (req, res, next) => {
  const { id } = req.params;
  const updatedUser = await userService.updateUser(id, req.body);

  res.status(200).json({
    message: "User updated successfully",
    data: updatedUser,
  });
};

/**
 * @desc    Delete user by ID
 * @route   DELETE /users/:id
 * @method  DELETE
 * @access  Private
 */
exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;
  await userService.deleteUser(id);
  res.status(200).json({
    message: "User deleted successfully",
    data: true,
  });
};

/**
 * @desc    Update profile picture
 * @route   PATCH /users/profile-picture
 * @method  PATCH
 * @access  Private
 */
exports.updateProfilePicture = async (req, res, next) => {
  const userId = req.user._id;

  const user = await userService.updateProfilePicture(userId, req.file);

  const profilePictureUrl = await userService.getProfilePictureUrl(user, [{ width: 200, height: 200 }, { radius: "max" }, { quality: 80 }]);

  res.status(200).json({
    status: "success",
    message: "Profile picture updated successfully",
    profilePicture: {
      fileId: user.profilePicture.fileId,
      imagePath: user.profilePicture.imagePath,
      optimizedUrl: profilePictureUrl,
    },
  });
};

/**
 * @desc    Delete profile picture
 * @route   DELETE /users/profile-picture
 * @method  DELETE
 * @access  Private
 */
exports.deleteProfilePicture = async (req, res, next) => {
  const userId = req.user._id;
  const user = await userService.deleteProfilePicture(userId);
  res.status(200).json({
    status: "success",
    message: "Profile picture deleted successfully",
    profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
  });
};

/**
 * @desc    Get Me
 * @route   GET /users/me
 * @method  GET
 * @access  Private/User/Admin
 */
exports.getMe = async (req, res, next) => {
  const userId = req.user._id;
  const user = await userService.getUserById(userId);
  res.status(200).json({
    message: "User fetched successfully",
    data: user,
  });
};

/**
 * @desc    Update Me
 * @route   PATCH /users/me
 * @method  PATCH
 * @access  Private/User/Admin
 */
exports.updateMe = async (req, res, next) => {
  const userId = req.user._id;
  const updatedUser = await userService.updateUser(userId, req.body);
  res.status(200).json({
    message: "User updated successfully",
    data: updatedUser,
  });
};
/**
 * @desc    Update Password
 * @route   PATCH /users/update-password
 * @method  PATCH
 */
exports.updatePassword = async (req, res, next) => {
  const userId = req.user._id;
  const updatedUser = await userService.updatePassword(userId, req.body);
  res.status(200).json({
    message: "Password updated successfully",
    data: updatedUser,
  });
};

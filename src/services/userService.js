const User = require("../models/userModel");
const APIFeatures = require("../utils/APIFeatures");
const ImageService = require("../services/imageKitService");
const AppError = require("../utils/appErrors");
class UserService {
  // GET all users
  static async getAllUsers(queryParams = {}) {
    const features = new APIFeatures(User.find().select("-password -__v"), queryParams).filter().search(["firstName", "lastName", "userName", "email"]).sort().limitFields().paginate();

    const users = await features.query.lean();

    // Build count query with same filters
    const totalQuery = new APIFeatures(User.find().select("-password -__v"), queryParams).filter().search(["firstName", "lastName", "userName", "email"]);
    const total = await totalQuery.query.countDocuments();

    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  // GET user by ID
  static async getUserById(id) {
    const user = await User.findById(id, { password: 0 });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  // UPDATE user by ID
  static async updateUser(id, updateData) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    user.set(updateData);
    const updatedUser = await user.save({ validateModifiedOnly: true });

    const userObj = updatedUser.toObject();
    delete userObj.password;
    delete userObj.confirmPassword;
    return userObj;
  }

  // DELETE user by ID
  static async deleteUser(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    // delete profile picture if exists
    if (user.profilePicture?.fileId) {
      await ImageService.deleteSingle(user.profilePicture.fileId);
    }
    await user.remove();
    return true;
  }

  // update profile picture
  static async updateProfilePicture(id, fileData) {
    console.log("Updating profile picture for user ID:", id, "with file data:", fileData);
    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    // delete old picture if exists
    if (user.profilePicture?.fileId) {
      await ImageService.deleteSingle(user.profilePicture.fileId);
    }
    // upload new picture
    const uploadedImage = await ImageService.uploadSingle(fileData, "/users/profile-pictures");
    user.profilePicture = {
      fileId: uploadedImage.fileId,
      imagePath: uploadedImage.url,
    };
    await user.save({ validateModifiedOnly: true });
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.confirmPassword;
    return userObj;
  }
  // delete profile picture
  static async deleteProfilePicture(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (user.profilePicture?.fileId) {
      await ImageService.deleteSingle(user.profilePicture.fileId);
    }
    user.profilePicture = {
      fileId: null,
      imagePath: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
    };
    await user.save({ validateModifiedOnly: true });
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.confirmPassword;
    return userObj;
  }
  // getProfilePictureUrl
  static async getProfilePictureUrl(user, transformations = []) {
    if (!user.profilePicture?.fileId) {
      return user.profilePicture?.imagePath || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
    }
    return ImageService.getImageUrl(user.profilePicture.imagePath, transformations);
  }

  // getMe
  static async getMe(userId) {
    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  // updateMe
  static async updateMe(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    user.set(updateData);
    const updatedUser = await user.save({ validateModifiedOnly: true });
    const userObj = updatedUser.toObject();
    delete userObj.password;
    delete userObj.confirmPassword;
    return userObj;
  }

  // updatePassword
  static async updatePassword(userId, { currentPassword, newPassword, confirmNewPassword }) {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      throw new AppError("Please provide currentPassword, newPassword and confirmNewPassword", 400);
    }
    if (newPassword !== confirmNewPassword) {
      throw new AppError("New password and confirm new password do not match", 400);
    }
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 401);
    }
    user.password = newPassword;
    await user.save();
    return true;
  }
}

module.exports = UserService;

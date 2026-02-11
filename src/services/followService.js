const Follow = require("../models/followModel");
const AppError = require("../utils/appErrors");
const APIFeatures = require("../utils/APIFeatures");

class FollowService {
  static async toggleFollow(follower, following) {
    if (follower.toString() === following.toString()) {
      throw new AppError("You cannot follow yourself", 400);
    }

    const existingFollow = await Follow.findOne({
      follower,
      following,
    });
    if (existingFollow) {
      await Follow.findByIdAndDelete(existingFollow._id);
    } else {
      await Follow.create({
        follower,
        following,
      });
    }
    return { following: !existingFollow };
  }

  // Get followers of a user
  static async getFollowers(userId, query) {
    const filter = { following: userId };
    const features = new APIFeatures(Follow.find(filter).populate("follower", "firstName lastName userName profilePicture"), query).filter().search(["follower.firstName", "follower.lastName", "follower.userName"]).sort().paginate().limitFields();
    const followers = await features.query;
    const totalQuery = new APIFeatures(Follow.find(filter), query).filter().search(["follower.firstName", "follower.lastName", "follower.userName"]);
    const total = await totalQuery.query.countDocuments();
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    return {
      followers: followers.map((follow) => follow.follower),
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

  // Get following of a user
  static async getFollowing(userId, query) {
    const filter = { follower: userId };
    const features = new APIFeatures(Follow.find(filter).populate("following", "firstName lastName userName profilePicture"), query).filter().search(["following.firstName", "following.lastName", "following.userName"]).sort().paginate().limitFields();
    const following = await features.query;
    const totalQuery = new APIFeatures(Follow.find(filter), query).filter().search(["following.firstName", "following.lastName", "following.userName"]);
    const total = await totalQuery.query.countDocuments();
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    return {
      following: following.map((follow) => follow.following),
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
}

module.exports = FollowService;

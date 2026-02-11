const Post = require("../models/postModel");
const AppError = require("../utils/appErrors");
const APIFeatures = require("../utils/APIFeatures");
const ImageService = require("../services/imageKitService");

class PostService {
  // Create a new post
  static async createPost(postData, userId, author) {
    const post = await Post.create({ ...postData, userId: userId.toString(), author, status: "draft", publishedAt: null });
    return post;
  }

  // GET all posts
  // user can see only published posts or their own posts
  static async getAllPosts(queryParams = {}, userId, role) {
    let baseQuery = {};
    if (role !== "admin") {
      baseQuery.$or = [
        { userId: userId.toString() },
        {
          $and: [{ status: "published" }, { publishedAt: { $lte: new Date() } }],
        },
        {
          status: "scheduled",
          publishedAt: { $lte: new Date() },
        },
      ];
    }
    const features = new APIFeatures(Post.find(baseQuery), queryParams).filter().search(["title", "content", "author", "tags"]).sort().limitFields().paginate();

    features.query = features.query.populate("userId", "userName profilePicture");

    const posts = await features.query.lean();

    // add isOwner to each post
    posts.forEach((post) => {
      post.isOwner = post.userId?._id?.toString() === userId.toString();
      if (post.status === "scheduled" && post.publishedAt <= new Date()) {
        post.status = "published";
      }
    });

    const totalQuery = new APIFeatures(Post.find(baseQuery), queryParams).filter().search(["title", "content", "author", "tags"]);
    const total = await totalQuery.query.countDocuments();

    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;

    return {
      posts,
      pagination: {
        page: page,
        limit: limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  // GET post by ID
  static async getPostById(postId, userId) {
    const post = await Post.findById(postId).populate("userId", "userName profilePicture").lean();
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    // add isOwner
    post.isOwner = post.userId?._id?.toString() === userId.toString();

    return post;
  }

  // UPDATE post by ID  (author only)
  static async updatePost(postId, updateData, userId, role) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    // check ownership
    if (role !== "admin" && post.userId?.toString() !== userId.toString()) {
      throw new AppError("Unauthorized to update this post", 403);
    }
    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, { new: true }).populate("userId", "userName profilePicture").lean();
    return updatedPost;
  }

  // DELETE post by ID
  static async deletePost(postId, userId, role = "user") {
    const post = await Post.findById(postId).populate("userId", "userName profilePicture");
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    // check ownership
    if (role !== "admin" && post.userId?._id?.toString() !== userId.toString()) {
      throw new AppError("Unauthorized to delete this post", 403);
    }
    // delete images from ImageKit
    if (post.images?.length) {
      await ImageService.deleteMultiple(post.images.map((img) => img.fileId));
    }
    await Post.findByIdAndDelete(postId);
    return post;
  }

  static async getAllPostsAdmin(queryParams = {}) {
    const baseQuery = {};

    const features = new APIFeatures(Post.find(baseQuery), queryParams).filter().search(["title", "content", "author", "tags"]).sort().limitFields().paginate();

    features.query = features.query.populate("userId", "userName profilePicture");

    const posts = await features.query.lean();

    posts.forEach((post) => {
      post.isPublished = post.status === "published";
      post.isOwner = false;
    });

    const totalQuery = new APIFeatures(Post.find(baseQuery), queryParams).filter().search(["title", "content", "author", "tags"]);
    const total = await totalQuery.query.countDocuments();
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    return {
      posts,
      pagination: {
        page: page,
        limit: limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  static async publishPost(postId, userId, role) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    // check ownership
    if (role !== "admin" && post.userId.toString() !== userId.toString()) {
      throw new AppError("Unauthorized to publish this post", 403);
    }
    post.status = "published";
    post.publishedAt = new Date();
    await post.save();
    return post;
  }

  // draft post - Unpublish
  static async draftPost(postId, userId, role) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    // check ownership
    if (role !== "admin" && post.userId.toString() !== userId.toString()) {
      throw new AppError("Unauthorized to draft this post", 403);
    }
    post.status = "draft";
    post.publishedAt = null;
    await post.save();
    return post;
  }

  // Schedule post
  static async schedulePost(postId, publishedAt, userId, role) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    // check ownership
    if (role !== "admin" && post.userId.toString() !== userId.toString()) {
      throw new AppError("Unauthorized to schedule this post", 403);
    }
    // check publishedAt is in the future
    if (publishedAt <= new Date()) {
      throw new AppError("Publish date must be in the future", 400);
    }

    post.status = "scheduled";
    post.publishedAt = publishedAt;
    await post.save();
    return post;
  }

  // increment view count
  static async incrementViewCount(postId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    post.views = (post.views || 0) + 1;
    await post.save();
    return post;
  }

  // get my posts
  static async getMyPosts(userId, queryParams = {}) {
    const baseQuery = { userId: userId.toString() };

    if (queryParams.status && queryParams.status !== "all") {
      baseQuery.status = queryParams.status;
    }

    const features = new APIFeatures(Post.find(baseQuery), queryParams).filter().search(["title", "content", "tags"]).sort().limitFields().paginate();

    const posts = await features.query.lean();

    posts.forEach((post) => {
      post.isOwner = true;
    });

    const totalQuery = new APIFeatures(Post.find(baseQuery), queryParams).filter().search(["title", "content", "tags"]);
    const total = await totalQuery.query.countDocuments();
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    return {
      posts,
      pagination: {
        page: page,
        limit: limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }
  // upload post images
  static async uploadPostImages(postId, files, userId, role) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    // check ownership
    if (role !== "admin" && post.userId.toString() !== userId.toString()) {
      throw new AppError("Unauthorized to upload images to this post", 403);
    }
    let images = [];
    if (files?.length) {
      const uploadedImages = await ImageService.uploadMultiple(files, "/posts/images");
      images = uploadedImages.map((img) => ({
        fileId: img.fileId,
        imagePath: img.url,
      }));
    }

    post.images.push(...images);
    await post.save();
    return post;
  }
  // delete post image
  static async deletePostImage(postId, fileId, userId, role) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    // check ownership
    if (role !== "admin" && post.userId.toString() !== userId.toString()) {
      throw new AppError("Unauthorized to delete images from this post", 403);
    }
    const imageIndex = post.images.findIndex((img) => img.fileId === fileId);
    if (imageIndex === -1) {
      throw new AppError("Image not found", 404);
    }
    await ImageService.deleteSingle(fileId);
    post.images.splice(imageIndex, 1);
    await post.save();
    return post;
  }
}

module.exports = PostService;

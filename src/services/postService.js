const Post = require("../models/postModel");
const AppError = require("../utils/appErrors");
const APIFeatures = require("../utils/APIFeatures");
const ImageService = require("../services/imageKitService");
const { redisClient } = require("../utils/redisClient");
const logger = require("../config/logger");

// Cache TTL in seconds
const POSTS_CACHE_TTL = 300; // 5 minutes

/**
 * Build a deterministic cache key from query params + user context.
 * Pattern: posts:<scope>:<sorted-query-string>
 */
const buildCacheKey = (prefix, queryParams = {}, extras = {}) => {
  const merged = { ...queryParams, ...extras };
  const sorted = Object.keys(merged)
    .sort()
    .map((k) => `${k}=${merged[k]}`)
    .join("&");
  return `posts:${prefix}:${sorted}`;
};

class PostService {
  /**
   * Invalidate all cached post lists.
   * Called after any create / update / delete / status-change operation.
   */
  static async invalidatePostsCache() {
    try {
      const count = await redisClient.deleteByPattern("posts:*");
      if (count) logger.debug("Redis: invalidated post caches", { deleted: count });
    } catch (err) {
      logger.warn("Redis cache invalidation error", { error: err.message });
    }
  }

  // Create a new post
  static async createPost(postData, userId, author) {
    const post = await Post.create({ ...postData, userId: userId.toString(), author, status: "draft", publishedAt: null });
    await PostService.invalidatePostsCache();
    return post;
  }

  // GET all posts
  // user can see only published posts or their own posts
  static async getAllPosts(queryParams = {}, userId, role) {
    // ── Try cache first ──
    const cacheKey = buildCacheKey("all", queryParams, { userId, role });
    try {
      const cached = await redisClient.getJSON(cacheKey);
      if (cached) {
        logger.debug("Redis cache HIT", { key: cacheKey });
        return cached;
      }
    } catch (err) {
      logger.warn("Redis cache read error (getAllPosts)", { error: err.message });
    }

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

    const result = {
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

    // ── Store in cache ──
    try {
      await redisClient.setJSON(cacheKey, result, POSTS_CACHE_TTL);
      logger.debug("Redis cache SET", { key: cacheKey, ttl: POSTS_CACHE_TTL });
    } catch (err) {
      logger.warn("Redis cache write error (getAllPosts)", { error: err.message });
    }

    return result;
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
    await PostService.invalidatePostsCache();
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
    await PostService.invalidatePostsCache();
    return post;
  }

  static async getAllPostsAdmin(queryParams = {}) {
    // ── Try cache first ──
    const cacheKey = buildCacheKey("admin", queryParams);
    try {
      const cached = await redisClient.getJSON(cacheKey);
      if (cached) {
        logger.debug("Redis cache HIT", { key: cacheKey });
        return cached;
      }
    } catch (err) {
      logger.warn("Redis cache read error (getAllPostsAdmin)", { error: err.message });
    }

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

    const result = {
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

    // ── Store in cache ──
    try {
      await redisClient.setJSON(cacheKey, result, POSTS_CACHE_TTL);
      logger.debug("Redis cache SET", { key: cacheKey, ttl: POSTS_CACHE_TTL });
    } catch (err) {
      logger.warn("Redis cache write error (getAllPostsAdmin)", { error: err.message });
    }

    return result;
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
    await PostService.invalidatePostsCache();
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
    await PostService.invalidatePostsCache();
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
    await PostService.invalidatePostsCache();
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
    // ── Try cache first ──
    const cacheKey = buildCacheKey("my", queryParams, { userId });
    try {
      const cached = await redisClient.getJSON(cacheKey);
      if (cached) {
        logger.debug("Redis cache HIT", { key: cacheKey });
        return cached;
      }
    } catch (err) {
      logger.warn("Redis cache read error (getMyPosts)", { error: err.message });
    }

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

    const result = {
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

    // ── Store in cache ──
    try {
      await redisClient.setJSON(cacheKey, result, POSTS_CACHE_TTL);
      logger.debug("Redis cache SET", { key: cacheKey, ttl: POSTS_CACHE_TTL });
    } catch (err) {
      logger.warn("Redis cache write error (getMyPosts)", { error: err.message });
    }

    return result;
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

  // ─── Popular Posts (by views or likes) 
  static async getPopularPosts(queryParams = {}) {
    const sortBy = queryParams.sortBy || "views"; // "views" | "likes"
    const limit = Math.min(parseInt(queryParams.limit) || 10, 50);
    const page = parseInt(queryParams.page) || 1;

    const cacheKey = `posts:popular:${sortBy}:page=${page}:limit=${limit}`;
    try {
      const cached = await redisClient.getJSON(cacheKey);
      if (cached) {
        logger.debug("Redis cache HIT", { key: cacheKey });
        return cached;
      }
    } catch (err) {
      logger.warn("Redis cache read error (getPopularPosts)", { error: err.message });
    }

    const sortField = sortBy === "likes" ? { likes: -1 } : { views: -1 };
    const baseQuery = { status: "published", publishedAt: { $lte: new Date() } };

    const posts = await Post.find(baseQuery)
      .sort(sortField)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "userName profilePicture")
      .lean();

    const total = await Post.countDocuments(baseQuery);

    const result = {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };

    try {
      await redisClient.setJSON(cacheKey, result, POSTS_CACHE_TTL);
      logger.debug("Redis cache SET", { key: cacheKey, ttl: POSTS_CACHE_TTL });
    } catch (err) {
      logger.warn("Redis cache write error (getPopularPosts)", { error: err.message });
    }

    return result;
  }

  // ─── Tags with Post Counts 
  static async getTagsWithCounts() {
    const cacheKey = "posts:tags";
    try {
      const cached = await redisClient.getJSON(cacheKey);
      if (cached) {
        logger.debug("Redis cache HIT", { key: cacheKey });
        return cached;
      }
    } catch (err) {
      logger.warn("Redis cache read error (getTagsWithCounts)", { error: err.message });
    }

    const tags = await Post.aggregate([
      { $match: { status: "published", publishedAt: { $lte: new Date() } } },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          tag: "$_id",
          count: 1,
        },
      },
    ]);

    try {
      await redisClient.setJSON(cacheKey, tags, POSTS_CACHE_TTL);
      logger.debug("Redis cache SET", { key: cacheKey, ttl: POSTS_CACHE_TTL });
    } catch (err) {
      logger.warn("Redis cache write error (getTagsWithCounts)", { error: err.message });
    }

    return tags;
  }
}

module.exports = PostService;

const Post = require("../models/postModel");
const AppError = require("../utils/appErrors");
const Comment = require("../models/commentModel");
const APIFeatures = require("../utils/APIFeatures");

class CommentService {
  // Create a new comment or reply
  static async createComment(commentData, userId) {
    const { parentCommentId, postId } = commentData;
    const maxDepth = 3;
    const post = await Post.findById(postId);

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (post.status !== "published") {
      throw new AppError(`Cannot comment on ${post.status} posts`, 400);
    }

    if (post.publishedAt && post.publishedAt > new Date()) {
      throw new AppError("Cannot comment on posts that are not published yet", 400);
    }

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        throw new AppError("Parent comment not found", 404);
      }
      if (parentComment.postId.toString() !== postId) {
        throw new AppError("Parent comment does not belong to this post", 400);
      }

      let depth = 1;
      let current = parentComment;
      while (current.parentCommentId) {
        depth += 1;
        if (depth >= maxDepth) break;
        current = await Comment.findById(current.parentCommentId);
        if (!current) {
          throw new AppError("Invalid parent comment chain", 400);
        }
      }

      const newDepth = depth + 1;
      if (newDepth > maxDepth) {
        throw new AppError(`Maximum comment depth is ${maxDepth}`, 400);
      }
    }

    const comment = await Comment.create({ ...commentData, userId });
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    return comment;
  }

  // Get comments with pagination, filtering, and isOwner flag
  static async getAllComments(query, userId) {
    const { postId, ...otherQueries } = query;
    let filter = {};
    if (postId) {
      filter.postId = postId;
    }
    const features = new APIFeatures(Comment.find(filter), otherQueries).filter().search(["content"]).sort().limitFields().paginate();
    const comments = await features.query.populate("userId", "firstName lastName userName profilePicture").lean();

    const commentsWithIsOwner = comments.map((comment) => {
      const commentObj = { ...comment };
      commentObj.isOwner = comment.userId?._id?.toString() === userId.toString();
      return commentObj;
    });
    const totalQuery = new APIFeatures(Comment.find(filter), otherQueries).filter().search(["content"]);
    const total = await totalQuery.query.countDocuments();
    const page = parseInt(otherQueries.page) || 1;
    const limit = parseInt(otherQueries.limit) || 10;
    return {
      comments: commentsWithIsOwner,
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

  // Get a comment by ID with owner flag
  static async getCommentById(commentId, userId) {
    const comment = await Comment.findById(commentId).populate("userId", "firstName lastName userName profilePicture").lean();

    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    comment.isOwner = comment.userId?._id?.toString() === userId.toString();
    return comment;
  }

  // Update comment (author only)
  static async updateCommentById(commentId, commentData, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }
    // Check if the user is the author of the comment
    if (comment.userId.toString() !== userId.toString()) {
      throw new AppError("You are not authorized to update this comment", 403);
    }
    comment.set(commentData);
    comment.isEdited = true;
    comment.editedAt = new Date();
    const updatedComment = await comment.save({ validateModifiedOnly: true });
    return updatedComment;
  }

  // Delete comment (author or post author)
  static async deleteCommentById(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }
    const post = await Post.findById(comment.postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    // Check if the user is the author of the comment or the post
    if (comment.userId.toString() !== userId.toString() && post.userId.toString() !== userId.toString()) {
      throw new AppError("You are not authorized to delete this comment", 403);
    }
    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });
    return;
  }

  // Get all comments for a specific post
  static async getCommentsByPost(postId, userId, query = {}) {
    const post = await Post.findById(postId);
    console.log("post", post);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const features = new APIFeatures(Comment.find({ postId }), query).filter().search(["content"]).sort().limitFields().paginate();

    const comments = await features.query.populate("userId", "firstName lastName userName profilePicture").lean();

    const commentsWithIsOwner = comments.map((comment) => {
      comment.isOwner = comment.userId?._id?.toString() === userId.toString();
      return comment;
    });

    // Build count query with same filters
    const totalQuery = new APIFeatures(
      Comment.find({
        postId,
        parentCommentId: { $exists: false },
      }),
      query,
    )
      .filter()
      .search(["content"]);
    const total = await totalQuery.query.countDocuments();

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    return {
      comments: commentsWithIsOwner,
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

  // Get replies for a specific comment
  static async getCommentReplies(commentId, userId) {
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      throw new AppError("Comment not found", 404);
    }
    const replies = await Comment.find({ parentCommentId: commentId }).populate("userId", "firstName lastName userName profilePicture").lean();

    replies.forEach((reply) => {
      reply.isOwner = reply.userId?._id?.toString() === userId.toString();
    });

    return replies;
  }
}

module.exports = CommentService;

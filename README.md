# Blog API - Advanced Express.js Application

A feature-rich blogging platform API built with Express.js, MongoDB, and modern web technologies. Includes user authentication, posts, comments, social features, and comprehensive security/performance optimizations.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Performance Features](#performance-features)
- [Security Features](#security-features)

---

## Features

### Core Functionality

✅ **User Management**

- User registration and authentication (JWT)
- Email verification with OTP
- Password reset via email
- Profile management with picture uploads
- User deactivation/reactivation

✅ **Blogging**

- Create, read, update, delete posts
- Multi-image uploads per post
- Draft, scheduled, and published statuses
- Full-text search on posts
- View tracking

✅ **Social Features**

- Like posts and comments
- Follow/unfollow users
- Bookmark posts
- Comment system with nested replies
- Real-time notifications

✅ **Advanced Features**

- Donation system (Stripe integration)
- Advanced pagination and filtering
- Rate limiting per endpoint
- Request validation with custom validators
- HTML sanitization for user content

---

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**:
  - bcrypt (password hashing)
  - helmet (security headers)
  - express-rate-limit (rate limiting)
  - xss-sanitizer (XSS protection)
  - mongo-sanitize (NoSQL injection protection)
  - hpp (HTTP Parameter Pollution)
- **Logging**: Winston + Morgan
- **File Upload**: Multer + ImageKit
- **Email**: Nodemailer
- **Payment**: Kashier
- **Utilities**: Axios, dotenv, query-string



## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd Blog-API

# Install dependencies
npm install

# Install optional security packages
npm install sanitize-html
```

## Running the Project

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:5000`

---

## API Documentation

### Authentication Endpoints

| Endpoint                       | Method | Description               | Auth | Rate Limit |
| ------------------------------ | ------ | ------------------------- | ---- | ---------- |
| `/api/v1/auth/signup`          | POST   | Register a new user       | No   | 5/15min    |
| `/api/v1/auth/signin`          | POST   | User login                | No   | 5/15min    |
| `/api/v1/auth/verify-email`    | POST   | Verify email with OTP     | No   | -          |
| `/api/v1/auth/forgot-password` | POST   | Request password reset    | No   | 3/hour     |
| `/api/v1/auth/reset-password`  | POST   | Reset password with token | No   | 3/hour     |

### User Endpoints

| Endpoint                        | Method | Description               | Auth | Role  |
| ------------------------------- | ------ | ------------------------- | ---- | ----- |
| `/api/v1/users`                 | GET    | Get all users (paginated) | Yes  | Admin |
| `/api/v1/users/:id`             | GET    | Get user by ID            | Yes  | Admin |
| `/api/v1/users/:id`             | PATCH  | Update user               | Yes  | Admin |
| `/api/v1/users/:id`             | DELETE | Delete user               | Yes  | Admin |
| `/api/v1/users/me`              | GET    | Get current user profile  | Yes  | User  |
| `/api/v1/users/me`              | PATCH  | Update current user       | Yes  | User  |
| `/api/v1/users/update-password` | PATCH  | Change password           | Yes  | User  |
| `/api/v1/users/profile-picture` | PATCH  | Upload profile picture    | Yes  | User  |
| `/api/v1/users/profile-picture` | DELETE | Delete profile picture    | Yes  | User  |
| `/api/v1/users/:userId/likes`   | GET    | Get user's likes          | Yes  | User  |
| `/api/v1/users/bookmarks`       | GET    | Get user's bookmarks      | Yes  | User  |

### Post Endpoints

| Endpoint                            | Method | Description                        | Auth | Rate Limit |
| ----------------------------------- | ------ | ---------------------------------- | ---- | ---------- |
| `/api/v1/posts`                     | POST   | Create a new post                  | Yes  | -          |
| `/api/v1/posts`                     | GET    | Get all posts (filtered/paginated) | Yes  | 100/15min  |
| `/api/v1/posts/my-posts`            | GET    | Get current user's posts           | Yes  | -          |
| `/api/v1/posts/:id`                 | GET    | Get post by ID                     | Yes  | -          |
| `/api/v1/posts/:id`                 | PATCH  | Update post                        | Yes  | Owner      |
| `/api/v1/posts/:id`                 | DELETE | Delete post                        | Yes  | Owner      |
| `/api/v1/posts/:id/view`            | POST   | Increment view count               | No   | -          |
| `/api/v1/posts/:id/draft`           | PATCH  | Save as draft                      | Yes  | Owner      |
| `/api/v1/posts/:id/schedule`        | PATCH  | Schedule post publication          | Yes  | Owner      |
| `/api/v1/posts/:id/publish`         | PATCH  | Publish post                       | Yes  | Owner      |
| `/api/v1/posts/:id/images`          | POST   | Upload post images                 | Yes  | 10/hour    |
| `/api/v1/posts/:id/images/:imageId` | DELETE | Delete post image                  | Yes  | Owner      |
| `/api/v1/posts/:postId/comments`    | GET    | Get comments on post               | Yes  | -          |
| `/api/v1/posts/:postId/bookmark`    | POST   | Bookmark/unbookmark post           | Yes  | -          |

### Comment Endpoints

| Endpoint               | Method | Description                  | Auth | Role  |
| ---------------------- | ------ | ---------------------------- | ---- | ----- |
| `/api/v1/comments`     | POST   | Create comment               | Yes  | User  |
| `/api/v1/comments`     | GET    | Get all comments (paginated) | Yes  | User  |
| `/api/v1/comments/:id` | GET    | Get comment by ID            | Yes  | User  |
| `/api/v1/comments/:id` | PATCH  | Update comment               | Yes  | Owner |
| `/api/v1/comments/:id` | DELETE | Delete comment               | Yes  | Owner |

### Like Endpoints

| Endpoint                              | Method | Description            | Auth | Role |
| ------------------------------------- | ------ | ---------------------- | ---- | ---- |
| `/api/v1/likes`                       | POST   | Like a post or comment | Yes  | User |
| `/api/v1/likes/:targetId/:targetType` | DELETE | Unlike post or comment | Yes  | User |
| `/api/v1/likes/:targetId/:targetType` | GET    | Get likes on target    | Yes  | User |

### Follow Endpoints

| Endpoint                          | Method | Description              | Auth | Role |
| --------------------------------- | ------ | ------------------------ | ---- | ---- |
| `/api/v1/users/:userId/follow`    | POST   | Follow user              | Yes  | User |
| `/api/v1/users/:userId/unfollow`  | POST   | Unfollow user            | Yes  | User |
| `/api/v1/users/:userId/followers` | GET    | Get user's followers     | Yes  | User |
| `/api/v1/users/:userId/following` | GET    | Get users being followed | Yes  | User |

### Bookmark Endpoints

| Endpoint                         | Method | Description          | Auth | Role |
| -------------------------------- | ------ | -------------------- | ---- | ---- |
| `/api/v1/posts/:postId/bookmark` | POST   | Toggle bookmark      | Yes  | User |
| `/api/v1/users/bookmarks`        | GET    | Get user's bookmarks | Yes  | User |

### Notification Endpoints

| Endpoint                         | Method | Description               | Auth | Role   |
| -------------------------------- | ------ | ------------------------- | ---- | ------ |
| `/api/v1/notifications`          | POST   | Create notification       | Yes  | System |
| `/api/v1/notifications`          | GET    | Get user's notifications  | Yes  | User   |
| `/api/v1/notifications/:id/read` | PATCH  | Mark notification as read | Yes  | User   |
| `/api/v1/notifications/read-all` | PATCH  | Mark all as read          | Yes  | User   |

### Donation Endpoints

| Endpoint                                   | Method | Description            | Auth | Role       |
| ------------------------------------------ | ------ | ---------------------- | ---- | ---------- |
| `/api/v1/donation/create-checkout-session` | POST   | Create Stripe session  | Yes  | User       |
| `/api/v1/donation/webhook`                 | POST   | Stripe webhook handler | No   | -          |
| `/api/v1/donation`                         | GET    | Get user's donations   | Yes  | User       |
| `/api/v1/donation/:id`                     | GET    | Get donation by ID     | Yes  | User/Admin |

---

## Project Structure

```
Blog-API/
├── src/
│   ├── config/              # Configuration files
│   │   ├── DB.js           # MongoDB connection
│   │   ├── logger.js       # Winston logger
│   │   ├── fileUpload.js   # Multer configuration
│   │   ├── imageKit.js     # ImageKit setup
│   │   └── swagger.js      # Swagger documentation
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   ├── likeController.js
│   │   ├── followController.js
│   │   ├── bookmarkController.js
│   │   ├── notificationController.js
│   │   └── donationController.js
│   ├── middlewares/         # Custom middlewares
│   │   ├── authenticate.js # JWT verification
│   │   ├── authorize.js    # Role-based access
│   │   ├── validate.js     # Request validation
│   │   ├── errorHandler.js # Global error handler
│   │   ├── rateLimiter.js  # Rate limiting
│   │   └── allowTo.js      # Role authorization
│   ├── models/              # Mongoose schemas
│   │   ├── userModel.js
│   │   ├── postModel.js
│   │   ├── commentModel.js
│   │   ├── likeModel.js
│   │   ├── followModel.js
│   │   ├── bookmarkModel.js
│   │   ├── notificationModel.js
│   │   └── donationModel.js
│   ├── routes/              # API routes
│   │   ├── v1/             # Version 1 routes
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   ├── likeRoutes.js
│   │   │   ├── followRoutes.js
│   │   │   ├── bookmarkRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── donationRoutes.js
│   │   │   └── index.js
│   │   └── v2/             # Future version routes
│   ├── schemas/             # Joi validation schemas
│   │   ├── auth/
│   │   ├── posts/
│   │   ├── comments/
│   │   ├── users/
│   │   ├── likes/
│   │   ├── follows/
│   │   ├── bookmarks/
│   │   ├── notifications/
│   │   └── donation/
│   ├── services/            # Business logic services
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── postService.js
│   │   ├── commentService.js
│   │   ├── likeService.js
│   │   ├── followService.js
│   │   ├── bookmarkService.js
│   │   ├── notificationService.js
│   │   └── donationService.js
│   ├── utils/               # Utility functions
│   │   ├── appErrors.js    # Custom error class
│   │   ├── APIFeatures.js  # Query features (pagination, filter, etc)
│   │   ├── JWT.js          # JWT utilities
│   │   ├── customValidators.js # Custom Joi validators
│   │   └── fileValidators.js   # File validation
│   ├── nodemailer/          # Email templates & config
│   │   ├── nodemailer.config.js
│   │   ├── templates.js
│   │   └── sendEmail files
│   ├── uploads/             # Local file uploads (temp)
│   ├── logs/                # Application logs
│   ├── app.js               # Express app setup
│   └── index.js             # Server entry point
├── .env                      # Environment variables
├── .env.example             # Example env file
├── .gitignore               # Git ignore rules
├── package.json             # Project dependencies
├── INDEX_STRATEGY.md        # Database indexing documentation
└── README.md                # This file
```

## Performance Features

### 🚀 Database Optimization

- ✅ **Comprehensive Indexing** (60+ indexes)
  - Single-field indexes for foreign keys
  - Compound indexes for common query patterns
  - Full-text search indexes
  - Unique constraints with sparse indexes
- ✅ **Query Optimization**
  - Pagination with limit/skip
  - Selective field projection
  - Efficient filtering
- ✅ **Atlas Search Ready** (for production)

### ⚡ Caching Strategies

- Redis ready (configured in dependencies)
- Request result caching capability
- Session management

### 📊 Request Handling

- **Pagination**: Size-aware pagination with defaults
- **Filtering**: Advanced filtering by status, date range, user, etc.
- **Sorting**: Multi-field sorting support
- **Search**: Full-text search on posts

### 🧵 Load Distribution

- Rate limiting per endpoint type:
  - General: 100 req/15 min
  - Authentication: 5 req/15 min
  - Password Reset: 3 req/hour
  - File Upload: 10 req/hour

---

## Security Features

### 🛡️ Authentication & Authorization

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Email verification with OTP
- ✅ Password reset via secure token
- ✅ Role-based access control (RBAC)
- ✅ User deactivation/reactivation


### 🌐 HTTP Security

- ✅ Security headers (Helmet)
- ✅ CORS enabled with configuration
- ✅ Rate limiting (express-rate-limit)
- ✅ Morgan request logging

### 📝 Error Handling

- ✅ Centralized error handler
- ✅ Custom error classes
- ✅ Detailed error logging
- ✅ Stack traces in development only

### 📊 Monitoring & Logging

- ✅ Winston logging with file rotation
- ✅ Log levels: error, warn, info, debug
- ✅ File and console output
- ✅ Request logging with Morgan
- ✅ Uncaught exception handling
- ✅ Unhandled rejection handling


## License

ISC License


## Support

For issues, questions, or contributions, please create a GitHub issue or contact the development team.

---


**Last Updated**: February 11, 2026

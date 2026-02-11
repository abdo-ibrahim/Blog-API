const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "userName is required"],
      trim: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, "firstName is required"],
    },
    lastName: {
      type: String,
      required: [true, "lastName is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    confirmPassword: {
      type: String,
      required: [true, "confirmPassword is required"],
      select: false,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords does not match",
      },
    },
    age: {
      type: Number,
      required: [true, "age is required"],
    },
    profilePicture: {
      fileId: String,
      imagePath: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailConfirmationToken: {
      type: String,
      default: undefined,
    },
    emailTokenExpires: {
      type: Date,
      default: undefined,
    },
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    OTP: String,
    OTPExpires: Date,
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    googleId: String,
    facebookId: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ userName: 1 }, { unique: true });
// Indexes for frequently searched/filtered fields
userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ createdAt: -1 }); // For sorting latest users
userSchema.index({ lastLogin: -1 }); // For finding recently active users
userSchema.index({ isActive: 1 }); // For filtering active users
userSchema.index({ role: 1 }); // For finding admin/user roles
userSchema.index({ googleId: 1 }, { sparse: true }); // For social login
userSchema.index({ facebookId: 1 }, { sparse: true }); // For social login

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// compare the password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// hash the password before saving
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
  }

  if (this.isModified("password") && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});

// to check if the password was changed
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createEmailConfirmationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  const encoded = crypto.createHash("sha256").update(token).digest("hex");
  this.verificationToken = encoded;
  this.verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000;
  return token;
};

// create a reset token
userSchema.methods.createResetPasswordToken = function () {
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  return resetToken;
};
userSchema.methods.createOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.OTP = otp;
  this.OTPExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return otp;
};

userSchema.virtual("followersCount", {
  ref: "Follow",
  localField: "_id",
  foreignField: "following",
  count: true,
});

userSchema.virtual("followingCount", {
  ref: "Follow",
  localField: "_id",
  foreignField: "follower",
  count: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;

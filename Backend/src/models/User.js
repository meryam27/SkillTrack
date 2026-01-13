const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password_hash: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: String,
    avatar_url: String,

    role: {
      type: String,
      enum: ["admin", "student", "graduate"],
      default: "student",
    },

    is_active: { type: Boolean, default: true },
    email_verified: { type: Boolean, default: false },
    lastLoginAt: Date,

    profile_completed: { type: Boolean, default: false },
    onboarding_completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);

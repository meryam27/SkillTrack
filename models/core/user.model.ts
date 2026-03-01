// /src/models/core/user.model.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  lastLogin?: Date;
  isActive: boolean;
  isVerified: boolean;
  role: string;

  getFullName(): string;
  validatePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: String,
    avatarUrl: {
      type: String,
      default: "/default-avatar.png",
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["student", "admin", "alumni", "coordinator"],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

// ================= METHODS =================
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

userSchema.methods.validatePassword = function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

// ================= HOOK =================
// Hash automatiquement le mot de passe avant save si modifié
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

export const User = mongoose.model<IUser>("User", userSchema);

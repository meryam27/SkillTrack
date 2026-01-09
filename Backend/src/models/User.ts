import mongoose, { Schema, type Document } from "mongoose";
// l'interface c'est juste pour typer dans typescript pour compilation (vérifie le code ) ,shema c'est pour runtime (vérifie les données)
export interface IUser extends Document {
  email: string;
  password_hash: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar_url?: string;
  role: "student" | "graduate";
  is_active: boolean;
  email_verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  profile_completed: boolean;
  onboarding_completed: boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password_hash: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: String,
    avatar_url: String,
    role: { type: String, enum: ["student", "graduate"], default: "student" },
    is_active: { type: Boolean, default: true },
    email_verified: { type: Boolean, default: false },
    lastLoginAt: Date,
    profile_completed: { type: Boolean, default: false }, // pour savoir si user a compléter l'insertion de toutes ses données personnelles
    onboarding_completed: { type: Boolean, default: false }, // le parcours de bienvenue
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

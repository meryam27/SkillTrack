import mongoose from "mongoose";
const { Schema } = mongoose;

const professionalExperienceSchema = new Schema(
  {
    job_title: { type: String, required: true },
    company: { type: String, required: true },
    domain: { type: String, required: true },
    years: { type: Number, required: true, min: 0 },
    description: String,
  },
  { _id: false }
);

const profileSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bio: String,
    university: String,
    degree: String,
    field_of_study: String,
    graduation_year: Number,
    career_goal: String,
    target_job_title: String,
    target_industries: [String],
    location: String,
    timezone: String,

    language_preference: {
      type: String,
      enum: ["fr", "en"],
      default: "en",
    },

    learning_style: {
      type: String,
      enum: ["visual", "auditory", "kinesthetic", "reading-writing"],
    },

    pace_preference: {
      type: String,
      enum: ["slow", "moderate", "fast"],
    },

    motivation_style: {
      type: String,
      enum: ["intrinsic", "extrinsic"],
    },

    notification_settings: {
      email_notifications: { type: Boolean, default: true },
      smart_nudges: { type: Boolean, default: true },
      weekly_digest: { type: Boolean, default: true },
      badge_alerts: { type: Boolean, default: true },
    },

    accessibility_preferences: {
      high_contrast: { type: Boolean, default: false },
      font_size: String,
      screen_reader: { type: Boolean, default: false },
    },

    professional_experiences: [professionalExperienceSchema],
  },
  { timestamps: true }
);

profileSchema.index({ user_id: 1 });
profileSchema.index({ target_job_title: 1 });

export const Profile = mongoose.model("Profile", profileSchema);

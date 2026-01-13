const mongoose = require("mongoose");
const { Schema } = mongoose;

const activitySessionSchema = new Schema(
  {
    session_id: { type: Schema.Types.ObjectId, auto: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    duration_minutes: { type: Number, required: true, min: 1 },
    activity_type: {
      type: String,
      enum: ["learning", "practice", "assessment", "community"],
      required: true,
    },
    skill_id: { type: Schema.Types.ObjectId, ref: "Skill" },
  },
  { _id: false }
);

const activityProfileSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    total_hours: { type: Number, default: 0, min: 0 },
    total_minutes: { type: Number, default: 0, min: 0 },

    daily_average_minutes: { type: Number, default: 0, min: 0 },
    weekly_total_hours: { type: Number, default: 0, min: 0 },
    monthly_total_hours: { type: Number, default: 0, min: 0 },

    sessions: [activitySessionSchema],

    current_session: {
      start_time: Date,
      activity_type: String,
    },

    days_active: { type: Number, default: 0, min: 0 },
    current_streak_days: { type: Number, default: 0, min: 0 },
    longest_streak_days: { type: Number, default: 0, min: 0 },

    leaderboard_position: { type: Number, min: 1 },

    last_activity_date: Date,
    last_weekly_reset: { type: Date, default: Date.now },
    last_monthly_reset: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// INDEXES
activityProfileSchema.index({ user_id: 1 });
activityProfileSchema.index({ total_hours: -1 });
activityProfileSchema.index({ weekly_total_hours: -1 });
activityProfileSchema.index({ monthly_total_hours: -1 });
activityProfileSchema.index({ current_streak_days: -1 });
activityProfileSchema.index({ last_activity_date: -1 });

// MIDDLEWARE
activityProfileSchema.pre("save", function (next) {
  this.total_hours = Math.floor(this.total_minutes / 60);
  next();
});

module.exports = mongoose.model("ActivityProfile", activityProfileSchema);

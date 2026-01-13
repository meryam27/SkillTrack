import mongoose from "mongoose";
const { Schema } = mongoose;

const goalSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    target_value: { type: Number, required: true, min: 1 },
    current_value: { type: Number, default: 0, min: 0 },
    unit: {
      type: String,
      enum: ["hours", "skills", "courses", "xp"],
      required: true,
    },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "completed", "overdue"],
      default: "active",
    },
  },
  { timestamps: true }
);

goalSchema.index({ user_id: 1, status: 1 });
goalSchema.index({ deadline: 1 });

export const Goal = mongoose.model("Goal", goalSchema);

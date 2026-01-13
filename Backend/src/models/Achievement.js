import mongoose from "mongoose";
const { Schema } = mongoose;

const achievementSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    rarity: {
      type: String,
      enum: ["Common", "Rare", "Épique", "Légendaire"],
      default: "Common",
    },
    icon: { type: String, required: true },
    unlocked_at: { type: Date, default: Date.now },
    condition_type: {
      type: String,
      enum: ["streak", "hours", "skills", "goals", "community"],
      required: true,
    },
    condition_value: { type: Number, required: true },
  },
  { timestamps: true }
);

achievementSchema.index({ user_id: 1, rarity: 1 });
achievementSchema.index({ unlocked_at: -1 });

export const Achievement = mongoose.model("Achievement", achievementSchema);

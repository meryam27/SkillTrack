const mongoose = require("mongoose");
const { Schema } = mongoose;

const skillSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },

    category: {
      type: String,
      enum: ["technical", "soft_skill", "language", "tool", "framework"],
      required: true,
    },

    description: { type: String, required: true },

    level_ranges: [
      {
        level: Number,
        name: String,
        description: String,
        estimated_hours: Number,
      },
    ],

    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    related_skills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],

    learning_resources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ["video", "article", "course", "documentation", "book"],
        },
        duration_minutes: Number,
        difficulty: {
          type: String,
          enum: ["beginner", "intermediate", "advanced"],
        },
        platform: String,
        rating: { type: Number, min: 0, max: 5 },
      },
    ],

    tags: [String],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

skillSchema.index({ name: 1 });
skillSchema.index({ category: 1 });
skillSchema.index({ "market_demand.trending": 1 });

module.exports = mongoose.model("Skill", skillSchema);

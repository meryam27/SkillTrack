import mongoose, { Schema, type Document } from "mongoose";

export interface ILevelRange {
  level: number;
  name: string;
  description: string;
  estimated_hours: number;
}
// on va la laisser pour l'instant jusqu'au version avec IA

// export interface IMarketDemand {
//   score: number;
//   trending: boolean;
//   job_postings_count: number;
//   last_updated: Date;
// }

export interface ILearningResource {
  title: string;
  url: string;
  type: "video" | "article" | "course" | "documentation" | "book";
  duration_minutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  platform: string;
  rating: number;
}

export interface ISkill extends Document {
  name: string;
  category: "technical" | "soft_skill" | "language" | "tool" | "framework";
  description: string;
  level_ranges: ILevelRange[];
  prerequisites?: mongoose.Types.ObjectId[];
  related_skills?: mongoose.Types.ObjectId[];
  // market_demand: IMarketDemand;
  learning_resources: ILearningResource[];
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

const skillSchema = new Schema<ISkill>(
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
    // market_demand: {
    //   score: { type: Number, min: 0, max: 100 },
    //   trending: Boolean,
    //   job_postings_count: Number,
    //   last_updated: Date,
    // },
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
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

skillSchema.index({ name: 1 });
skillSchema.index({ category: 1 });
skillSchema.index({ "market_demand.trending": 1 });

export const Skill = mongoose.model<ISkill>("Skill", skillSchema);

// /src/models/competences/competence.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICompetence extends Document {
  code: string;
  institutionId: string;
  name: string;
  description: string;
  detailedDescription: string;
  category: string;
  domain: string;
  tags: string[];
  level: string;
  estimatedHours: number;
  popularityScore: number;
  lastUpdated: Date;

  // Références
  prerequisites: mongoose.Types.ObjectId[];
  nextCompetences: mongoose.Types.ObjectId[];

  // Validation
  passingScore: number;
  minProjectsRequired: number;
}

const competenceSchema = new Schema<ICompetence>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    institutionId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    detailedDescription: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    level: {
      type: String,
      required: true,
      enum: ["Débutant", "Intermédiaire", "Avancé", "Expert"],
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    popularityScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    minProjectsRequired: {
      type: Number,
      default: 1,
      min: 0,
    },
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Competence",
      },
    ],
    nextCompetences: [
      {
        type: Schema.Types.ObjectId,
        ref: "Competence",
      },
    ],
  },
  {
    timestamps: true,
    collection: "competences",
  },
);

// Index
competenceSchema.index({ code: 1, institutionId: 1 });
competenceSchema.index({ domain: 1, category: 1, level: 1 });
competenceSchema.index({ tags: 1 });
competenceSchema.index({ popularityScore: -1 });
competenceSchema.index({
  name: "text",
  description: "text",
  detailedDescription: "text",
});

export const Competence = mongoose.model<ICompetence>(
  "Competence",
  competenceSchema,
);

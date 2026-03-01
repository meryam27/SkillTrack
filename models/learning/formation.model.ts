// /src/models/learning/formation.model.ts
import mongoose, { Schema, Document } from "mongoose";

export enum FormationType {
  MOOC = "MOOC",
  UNIVERSITY_COURSE = "UNIVERSITY_COURSE",
  WORKSHOP = "WORKSHOP",
  BOOTCAMP = "BOOTCAMP",
  CONFERENCE = "CONFERENCE",
}

export interface IFormation extends Document {
  title: string;
  type: FormationType;
  platform: string;
  url: string;
  description: string;
  level: string;
  estimatedHours: number;
  language: string;
  isCertified: boolean;
  cost: number;
  studentCount: number;
  averageRating: number;
  lastRecommended: Date;

  // Références
  coveredCompetences: mongoose.Types.ObjectId[];
}

const formationSchema = new Schema<IFormation>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(FormationType),
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["Débutant", "Intermédiaire", "Avancé"],
      required: true,
    },
    estimatedHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    language: {
      type: String,
      default: "Français",
    },
    isCertified: {
      type: Boolean,
      default: false,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    studentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    lastRecommended: {
      type: Date,
    },
    coveredCompetences: [
      {
        type: Schema.Types.ObjectId,
        ref: "Competence",
      },
    ],
  },
  {
    timestamps: true,
    collection: "formations",
  },
);

// Index
formationSchema.index({ title: "text", description: "text" });
formationSchema.index({ type: 1, level: 1 });
formationSchema.index({ platform: 1, isCertified: 1 });
formationSchema.index({ averageRating: -1 });
formationSchema.index({ studentCount: -1 });
formationSchema.index({ coveredCompetences: 1 });

export const Formation = mongoose.model<IFormation>(
  "Formation",
  formationSchema,
);

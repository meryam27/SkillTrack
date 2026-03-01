// /src/models/recommendation/recommendation.model.ts
import mongoose, { Schema, Document } from "mongoose";

export enum RecommendationType {
  COMPETENCE = "COMPETENCE",
  FORMATION = "FORMATION",
  PROJECT = "PROJECT",
  RESOURCE = "RESOURCE",
  CAREER_PATH = "CAREER_PATH",
}

export enum RecommendationStatus {
  PENDING = "PENDING",
  VIEWED = "VIEWED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  IMPLEMENTED = "IMPLEMENTED",
}

export interface IRecommendation extends Document {
  studentId: mongoose.Types.ObjectId;
  type: RecommendationType;
  title: string;
  description: string;
  rationale: string;
  relevanceScore: number;
  urgencyScore: number;
  targetId: mongoose.Types.ObjectId;
  targetType: string;
  generatedAt: Date;
  generationModel: string;
  influencingFactors: string[];
  status: RecommendationStatus;
  actionedAt: Date;
  actionNotes: string;
  userRating: number;
  userFeedback: string;
}

const recommendationSchema = new Schema<IRecommendation>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(RecommendationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    rationale: {
      type: String,
    },
    relevanceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    urgencyScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    generationModel: {
      type: String,
      required: true,
    },
    influencingFactors: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: Object.values(RecommendationStatus),
      default: RecommendationStatus.PENDING,
    },
    actionedAt: {
      type: Date,
    },
    actionNotes: {
      type: String,
    },
    userRating: {
      type: Number,
      min: 0,
      max: 5,
    },
    userFeedback: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "recommendations",
  },
);

// Index
recommendationSchema.index({ studentId: 1, status: 1 });
recommendationSchema.index({ type: 1, relevanceScore: -1 });
recommendationSchema.index({ generatedAt: -1 });
recommendationSchema.index({ studentId: 1, type: 1, targetId: 1 });

export const Recommendation = mongoose.model<IRecommendation>(
  "Recommendation",
  recommendationSchema,
);

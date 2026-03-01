// /src/models/portfolio/portfolio.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPortfolio extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  personalStatement: string;
  theme: string;
  customDomain: string;
  isPublished: boolean;
  publishedAt: Date;
  viewCount: number;

  // Références
  featuredProjects: mongoose.Types.ObjectId[];
  highlightedCompetences: mongoose.Types.ObjectId[];
}

const portfolioSchema = new Schema<IPortfolio>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    personalStatement: {
      type: String,
      maxlength: 2000,
    },
    theme: {
      type: String,
      default: "default",
    },
    customDomain: {
      type: String,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    featuredProjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    highlightedCompetences: [
      {
        type: Schema.Types.ObjectId,
        ref: "Competence",
      },
    ],
  },
  {
    timestamps: true,
    collection: "portfolios",
  },
);

// Index
portfolioSchema.index({ studentId: 1, isPublished: 1 });
portfolioSchema.index({ customDomain: 1 });
portfolioSchema.index({ viewCount: -1 });
portfolioSchema.index({ publishedAt: -1 });

export const Portfolio = mongoose.model<IPortfolio>(
  "Portfolio",
  portfolioSchema,
);

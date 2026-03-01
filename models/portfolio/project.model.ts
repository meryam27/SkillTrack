// /src/models/portfolio/project.model.ts
import mongoose, { Schema, Document } from "mongoose";

export enum ProjectType {
  ACADEMIC = "ACADEMIC",
  PERSONAL = "PERSONAL",
  PROFESSIONAL = "PROFESSIONAL",
  OPEN_SOURCE = "OPEN_SOURCE",
}

export enum VisibilityLevel {
  PRIVATE = "PRIVATE",
  PUBLIC = "PUBLIC",
  INSTITUTION = "INSTITUTION",
  LINKEDIN = "LINKEDIN",
}

export interface IProject extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  type: ProjectType;
  description: string;
  problemStatement: string;
  solutionDescription: string;
  technologies: string[];
  repositoryUrl: string;
  liveDemoUrl: string;
  documentationUrl: string;
  isTeamProject: boolean;
  roleInProject: string;
  startDate: Date;
  endDate: Date;
  estimatedHours: number;
  visibility: VisibilityLevel;
  isFeatured: boolean;

  // Références
  demonstratedCompetences: mongoose.Types.ObjectId[];
}

const projectSchema = new Schema<IProject>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(ProjectType),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    problemStatement: {
      type: String,
    },
    solutionDescription: {
      type: String,
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    repositoryUrl: {
      type: String,
      trim: true,
    },
    liveDemoUrl: {
      type: String,
      trim: true,
    },
    documentationUrl: {
      type: String,
      trim: true,
    },
    isTeamProject: {
      type: Boolean,
      default: false,
    },
    roleInProject: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    visibility: {
      type: String,
      enum: Object.values(VisibilityLevel),
      default: VisibilityLevel.PRIVATE,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    demonstratedCompetences: [
      {
        type: Schema.Types.ObjectId,
        ref: "Competence",
      },
    ],
  },
  {
    timestamps: true,
    collection: "projects",
  },
);

// Index
projectSchema.index({ studentId: 1, type: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ isFeatured: 1, visibility: 1 });
projectSchema.index({ title: "text", description: "text" });
projectSchema.index({ demonstratedCompetences: 1 });
projectSchema.index({ startDate: -1 });

export const Project = mongoose.model<IProject>("Project", projectSchema);

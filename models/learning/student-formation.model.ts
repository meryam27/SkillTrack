// /src/models/learning/student-formation.model.ts
import mongoose, { Schema, Document } from "mongoose";

export enum EnrollmentStatus {
  ENROLLED = "ENROLLED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  DROPPED = "DROPPED",
  CERTIFIED = "CERTIFIED",
}

export interface IStudentFormation extends Document {
  studentId: mongoose.Types.ObjectId;
  formationId: mongoose.Types.ObjectId;
  status: EnrollmentStatus;
  progress: number;
  grade: number;
  certificateUrl: string;
  enrolledAt: Date;
  completedAt: Date;
  expectedCompletion: Date;
}

const studentFormationSchema = new Schema<IStudentFormation>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    formationId: {
      type: Schema.Types.ObjectId,
      ref: "Formation",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.ENROLLED,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
    },
    certificateUrl: {
      type: String,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    expectedCompletion: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "student_formations",
  },
);

// Index unique
studentFormationSchema.index(
  { studentId: 1, formationId: 1 },
  { unique: true },
);

// Index pour les requêtes
studentFormationSchema.index({ studentId: 1, status: 1 });
studentFormationSchema.index({ formationId: 1, status: 1 });
studentFormationSchema.index({ progress: -1 });
studentFormationSchema.index({ enrolledAt: -1 });

export const StudentFormation = mongoose.model<IStudentFormation>(
  "StudentFormation",
  studentFormationSchema,
);

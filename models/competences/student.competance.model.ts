// /src/models/competences/student-competence.model.ts
import mongoose, { Schema, Document } from "mongoose";

export enum AcquisitionStatus {
  TO_ACQUIRE = "TO_ACQUIRE",
  IN_PROGRESS = "IN_PROGRESS",
  ACQUIRED = "ACQUIRED",
  VALIDATED = "VALIDATED",
}

export interface IStudentCompetence extends Document {
  studentId: mongoose.Types.ObjectId;
  competenceId: mongoose.Types.ObjectId;
  status: AcquisitionStatus;
  selfAssessedLevel: number;
  validatedLevel: number;
  confidenceScore: number;
  startedAt: Date;
  completedAt: Date;
  lastPracticed: Date;
  hoursInvested: number;
  projectsCompleted: number;
  notes: string[];
}

const studentCompetenceSchema = new Schema<IStudentCompetence>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    competenceId: {
      type: Schema.Types.ObjectId,
      ref: "Competence",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AcquisitionStatus),
      default: AcquisitionStatus.TO_ACQUIRE,
    },
    selfAssessedLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    validatedLevel: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    lastPracticed: {
      type: Date,
      default: Date.now,
    },
    hoursInvested: {
      type: Number,
      default: 0,
      min: 0,
    },
    projectsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    collection: "student_competences",
  },
);

// Index unique pour éviter les doublons
studentCompetenceSchema.index(
  { studentId: 1, competenceId: 1 },
  { unique: true },
);

// Index pour les requêtes fréquentes
studentCompetenceSchema.index({ studentId: 1, status: 1 });
studentCompetenceSchema.index({ competenceId: 1, status: 1 });
studentCompetenceSchema.index({ lastPracticed: -1 });
studentCompetenceSchema.index({ confidenceScore: -1 });

// Méthodes d'instance
studentCompetenceSchema.methods.calculateMasteryScore = function (): number {
  const levelScore = (this.validatedLevel || this.selfAssessedLevel) * 20;
  const confidenceBonus = this.confidenceScore * 10;
  const hoursBonus = Math.min(this.hoursInvested / 10, 20);
  const projectsBonus = Math.min(this.projectsCompleted * 5, 20);

  return Math.min(
    levelScore + confidenceBonus + hoursBonus + projectsBonus,
    100,
  );
};

export const StudentCompetence = mongoose.model<IStudentCompetence>(
  "StudentCompetence",
  studentCompetenceSchema,
);

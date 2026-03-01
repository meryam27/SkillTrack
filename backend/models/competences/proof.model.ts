// /src/models/competences/proof.model.ts
import mongoose, { Schema, Document } from "mongoose";

export enum ProofType {
  CERTIFICATE = "CERTIFICATE",
  PROJECT = "PROJECT",
  EXAM = "EXAM",
  WORK_EXPERIENCE = "WORK_EXPERIENCE",
  VALIDATION = "VALIDATION",
}

export interface IProof extends Document {
  type: ProofType;
  title: string;
  description: string;
  url: string;
  attachment: string;
  date: Date;
  issuer: string;
  score: number;
  isVerified: boolean;
  verifiedBy: mongoose.Types.ObjectId;
  verifiedAt: Date;
  metadata: Record<string, any>;

  // Références
  studentCompetenceId: mongoose.Types.ObjectId;
}

const proofSchema = new Schema<IProof>(
  {
    type: {
      type: String,
      enum: Object.values(ProofType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    url: {
      type: String,
      trim: true,
    },
    attachment: {
      type: String, // Chemin du fichier stocké
    },
    date: {
      type: Date,
      required: true,
    },
    issuer: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    studentCompetenceId: {
      type: Schema.Types.ObjectId,
      ref: "StudentCompetence",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "proofs",
  },
);

// Index
proofSchema.index({ studentCompetenceId: 1, type: 1 });
proofSchema.index({ isVerified: 1, date: -1 });
proofSchema.index({ issuer: 1 });

export const Proof = mongoose.model<IProof>("Proof", proofSchema);

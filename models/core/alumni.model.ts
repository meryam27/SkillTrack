// /src/models/core/alumni.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { IUser, User } from "./user.model";

export interface IAlumni extends IUser {
  studentId: string;
  graduationDate: Date;
  currentJobTitle: string;
  currentCompany: string;
  industry: string;
  yearsExperience: number;
  isMentor: boolean;
  shareContactInfo: boolean;
}

const alumniSchema = new Schema<IAlumni>(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    graduationDate: {
      type: Date,
      required: true,
    },
    currentJobTitle: {
      type: String,
    },
    currentCompany: {
      type: String,
    },
    industry: {
      type: String,
    },
    yearsExperience: {
      type: Number,
      default: 0,
    },
    isMentor: {
      type: Boolean,
      default: false,
    },
    shareContactInfo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index pour la recherche d'anciens élèves
alumniSchema.index({ industry: 1, currentCompany: 1 });
alumniSchema.index({ isMentor: 1 });
alumniSchema.index({ graduationDate: -1 });

export const Alumni = User.discriminator<IAlumni>("Alumni", alumniSchema);

// /src/models/core/student.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";
import { User } from "./user.model";
export interface IStudent extends IUser {
  filiereId: mongoose.Types.ObjectId;
  niveau: string;
  promotion: number;
  groupeId: string;
  academicEmail: string;
  inscriptionDate: Date;
  expectedGraduation: Date;

  // Références
  preferences?: mongoose.Types.ObjectId;
  objectives?: mongoose.Types.ObjectId;

  // Méthodes spécifiques
  calculateAcademicProgress(): Promise<number>;
  getCompetenceStatistics(): Promise<Record<string, number>>;
}

const studentSchema = new Schema<IStudent>(
  {
    filiereId: {
      type: Schema.Types.ObjectId,
      ref: "Filiere",
      //required: true,
    },
    niveau: {
      type: String,
      required: true,
      enum: ["L1", "L2", "L3", "M1", "M2", "Doctorat"],
    },
    promotion: {
      type: Number,
      //required: true,
    },
    groupeId: {
      type: String,
    },
    academicEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    inscriptionDate: {
      type: Date,
      // required: true,
      default: Date.now,
    },
    expectedGraduation: {
      type: Date,
      // required: true,
    },
    preferences: {
      type: Schema.Types.ObjectId,
      ref: "StudentPreferences",
    },
    objectives: {
      type: Schema.Types.ObjectId,
      ref: "StudentObjectives",
    },
  },
  {
    timestamps: true,
  },
);

// Index
studentSchema.index({ filiereId: 1, niveau: 1 });
studentSchema.index({ promotion: 1, groupeId: 1 });
studentSchema.index({ expectedGraduation: 1 });

// Méthodes d'instance
studentSchema.methods.calculateAcademicProgress =
  async function (): Promise<number> {
    // Logique de calcul du progrès académique
    return 0; // Implémentation à compléter
  };

studentSchema.methods.getCompetenceStatistics = async function (): Promise<
  Record<string, number>
> {
  // Logique pour les statistiques de compétences
  return {}; // Implémentation à compléter
};

export const Student = User.discriminator<IStudent>("Student", studentSchema);

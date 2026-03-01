// /src/models/core/filiere.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IFiliere extends Document {
  id: string;
  titre: string;
  description: string;
  debouches: string[];
  anneeCreation: number;
  isActive: boolean;
  studentsCount: number;
  averageProgress: number;

  // Méthodes
  updateStudentsCount(): Promise<void>;
}

const filiereSchema = new Schema<IFiliere>(
  {
    titre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    debouches: [
      {
        type: String,
        trim: true,
      },
    ],
    anneeCreation: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    studentsCount: {
      type: Number,
      default: 0,
    },
    averageProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    collection: "filieres",
  },
);

// Index
filiereSchema.index({ isActive: 1, anneeCreation: -1 });
filiereSchema.index({ titre: "text", description: "text" });

// Méthodes d'instance
filiereSchema.methods.updateStudentsCount = async function (): Promise<void> {
  const Student = mongoose.model("Student");
  const count = await Student.countDocuments({
    filiereId: this._id,
    isActive: true,
  });
  this.studentsCount = count;
  await this.save();
};

// Middleware pour mettre à jour le compteur
filiereSchema.post("save", async function () {
  await this.updateStudentsCount();
});

export const Filiere = mongoose.model<IFiliere>("Filiere", filiereSchema);

// /src/models/core/coordinator.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { IUser, User } from "./user.model";

export interface ICoordinator extends IUser {
  employeeId: string;
  academicRank: string;
  specialization: string;
  officeEmail: string;
  officeLocation: string;
  appointmentDate: Date;

  // Références
  managedFilieres: mongoose.Types.ObjectId[];
}

const coordinatorSchema = new Schema<ICoordinator>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    academicRank: {
      type: String,
      required: true,
      enum: [
        "Professeur",
        "Maître de conférences",
        "Chargé de cours",
        "Assistant",
      ],
    },
    specialization: {
      type: String,
      required: true,
    },
    officeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    officeLocation: {
      type: String,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    managedFilieres: [
      {
        type: Schema.Types.ObjectId,
        ref: "Filiere",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index
coordinatorSchema.index({ managedFilieres: 1 });
coordinatorSchema.index({ specialization: 1, academicRank: 1 });

export const Coordinator = User.discriminator<ICoordinator>(
  "Coordinator",
  coordinatorSchema,
);

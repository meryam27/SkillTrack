// /src/models/core/admin.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { IUser, User } from "./user.model";

export interface IAdmin extends IUser {
  department: string;
  adminLevel: string;
  permissions: string[];
  lastReportGenerated: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    department: {
      type: String,
      required: true,
    },
    adminLevel: {
      type: String,
      required: true,
      enum: ["super", "department", "filiere", "support"],
    },
    permissions: [
      {
        type: String,
        enum: [
          "manage_users",
          "manage_competences",
          "generate_reports",
          "system_config",
          "content_management",
        ],
      },
    ],
    lastReportGenerated: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const Admin = User.discriminator<IAdmin>("Admin", adminSchema);

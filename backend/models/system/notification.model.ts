// /src/models/system/notification.model.ts
import mongoose, { Schema, Document } from "mongoose";

export enum NotificationType {
  WELCOME = "WELCOME",
  DEADLINE = "DEADLINE",
  ACHIEVEMENT = "ACHIEVEMENT",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  RECOMMENDATION = "RECOMMENDATION",
  VALIDATION_REQUEST = "VALIDATION_REQUEST",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  priority: Priority;
  isRead: boolean;
  expiresAt: Date;
  actionUrl: string;
  metadata: Record<string, any>;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
    actionUrl: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  },
);

// Index
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ expiresAt: 1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);

// /src/models/career/roadmap-item.model.ts
import mongoose, { Schema, Document } from "mongoose";

export enum ItemType {
  COMPETENCE_ITEM = "COMPETENCE_ITEM",
  FORMATION_ITEM = "FORMATION_ITEM",
  PROJECT_ITEM = "PROJECT_ITEM",
  EVENT_ITEM = "EVENT_ITEM",
}

export enum ItemStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  BLOCKED = "BLOCKED",
  CANCELLED = "CANCELLED",
}

export interface IRoadmapItem extends Document {
  phaseId: mongoose.Types.ObjectId;
  type: ItemType;
  title: string;
  description: string;
  priority: number;
  status: ItemStatus;
  targetId: mongoose.Types.ObjectId;
  scheduledStart: Date;
  scheduledEnd: Date;
  estimatedHours: number;

  // Champ discriminatoire
  itemType: string;
}

const roadmapItemSchema = new Schema<IRoadmapItem>(
  {
    phaseId: {
      type: Schema.Types.ObjectId,
      ref: "RoadmapPhase",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ItemType),
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
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: Object.values(ItemStatus),
      default: ItemStatus.NOT_STARTED,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    scheduledStart: {
      type: Date,
    },
    scheduledEnd: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    itemType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "itemType",
    collection: "roadmap_items",
  },
);

// Index
roadmapItemSchema.index({ phaseId: 1, type: 1 });
roadmapItemSchema.index({ status: 1, priority: -1 });
roadmapItemSchema.index({ scheduledEnd: 1 });

export const RoadmapItem = mongoose.model<IRoadmapItem>(
  "RoadmapItem",
  roadmapItemSchema,
);

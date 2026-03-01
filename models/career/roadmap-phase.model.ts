// /src/models/career/roadmap-phase.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRoadmapPhase extends Document {
  roadmapId: mongoose.Types.ObjectId;
  order: number;
  title: string;
  description: string;
  estimatedWeeks: number;
  plannedStart: Date;
  plannedEnd: Date;
  isCompleted: boolean;
  actualStart: Date;
  actualEnd: Date;
  notes: string;

  // Références
  items: mongoose.Types.ObjectId[];
}

const roadmapPhaseSchema = new Schema<IRoadmapPhase>(
  {
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    estimatedWeeks: {
      type: Number,
      required: true,
      min: 1,
    },
    plannedStart: {
      type: Date,
      required: true,
    },
    plannedEnd: {
      type: Date,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    actualStart: {
      type: Date,
    },
    actualEnd: {
      type: Date,
    },
    notes: {
      type: String,
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "RoadmapItem",
      },
    ],
  },
  {
    timestamps: true,
    collection: "roadmap_phases",
  },
);

// Index
roadmapPhaseSchema.index({ roadmapId: 1, order: 1 });
roadmapPhaseSchema.index({ roadmapId: 1, isCompleted: 1 });
roadmapPhaseSchema.index({ plannedEnd: 1 });

export const RoadmapPhase = mongoose.model<IRoadmapPhase>(
  "RoadmapPhase",
  roadmapPhaseSchema,
);

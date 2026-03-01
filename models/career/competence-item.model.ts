// /src/models/career/competence-item.model.ts
import mongoose, { Schema } from "mongoose";
import { IRoadmapItem, RoadmapItem } from "./roadmap-item.model";

export interface ICompetenceItem extends IRoadmapItem {
  targetCompetenceId: mongoose.Types.ObjectId;
  requiredLevel: number;
}

const competenceItemSchema = new Schema<ICompetenceItem>({
  targetCompetenceId: {
    type: Schema.Types.ObjectId,
    ref: "Competence",
    required: true,
  },
  requiredLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
});

export const CompetenceItem = RoadmapItem.discriminator<ICompetenceItem>(
  "CompetenceItem",
  competenceItemSchema,
);

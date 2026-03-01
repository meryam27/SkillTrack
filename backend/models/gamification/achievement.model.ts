// /src/models/gamification/achievement.model.ts
import mongoose, { Schema, Document } from "mongoose";

export enum AchievementRarity {
  COMMON = "COMMON",
  UNCOMMON = "UNCOMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
}

export enum AchievementCategory {
  LEARNING = "LEARNING",
  COMPETENCE = "COMPETENCE",
  SOCIAL = "SOCIAL",
  STREAK = "STREAK",
  COMPLETION = "COMPLETION",
  EXCELLENCE = "EXCELLENCE",
}

export interface IAchievement extends Document {
  studentId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  points: number;
  unlockedAt: Date;
  criteria: {
    type: string;
    value: number;
    target: number;
  };
  isVisible: boolean;
  metadata: Record<string, any>;
}

const achievementSchema = new Schema<IAchievement>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(AchievementCategory),
      required: true,
    },
    rarity: {
      type: String,
      enum: Object.values(AchievementRarity),
      default: AchievementRarity.COMMON,
    },
    icon: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 10,
      min: 0,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    criteria: {
      type: {
        type: String,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      target: {
        type: Number,
        required: true,
      },
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "achievements",
  },
);

// Index pour les requêtes fréquentes
achievementSchema.index({ studentId: 1, unlockedAt: -1 });
achievementSchema.index({ studentId: 1, category: 1 });
achievementSchema.index({ rarity: 1, category: 1 });
achievementSchema.index({ unlockedAt: -1 });

// Méthode pour vérifier si un achievement est débloqué
achievementSchema.methods.checkUnlocked = function (): boolean {
  return this.criteria.value >= this.criteria.target;
};

export const Achievement = mongoose.model<IAchievement>(
  "Achievement",
  achievementSchema,
);

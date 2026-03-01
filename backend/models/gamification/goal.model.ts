// /src/models/gamification/goal.model.ts
import mongoose, { Schema, Document } from "mongoose";

export enum GoalStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
  EXPIRED = "EXPIRED",
}

export enum GoalType {
  LEARNING_HOURS = "LEARNING_HOURS",
  COMPETENCE_ACQUISITION = "COMPETENCE_ACQUISITION",
  FORMATION_COMPLETION = "FORMATION_COMPLETION",
  PROJECT_COMPLETION = "PROJECT_COMPLETION",
  STREAK_MAINTENANCE = "STREAK_MAINTENANCE",
  SKILL_MASTERY = "SKILL_MASTERY",
  CUSTOM = "CUSTOM",
}

export enum GoalPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface IGoal extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: GoalType;
  status: GoalStatus;
  priority: GoalPriority;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  createdAt: Date;
  completedAt: Date;
  reminderEnabled: boolean;
  reminderFrequency: string;
  metadata: Record<string, any>;

  // Références optionnelles
  relatedCompetenceId?: mongoose.Types.ObjectId;
  relatedFormationId?: mongoose.Types.ObjectId;

  // methode de calcul ajouté
  calculateProgress(): number;
}

const goalSchema = new Schema<IGoal>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(GoalType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(GoalStatus),
      default: GoalStatus.ACTIVE,
    },
    priority: {
      type: String,
      enum: Object.values(GoalPriority),
      default: GoalPriority.MEDIUM,
    },
    targetValue: {
      type: Number,
      required: true,
      min: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      default: "unités",
    },
    deadline: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderFrequency: {
      type: String,
      enum: ["daily", "weekly", "biweekly", "none"],
      default: "none",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    relatedCompetenceId: {
      type: Schema.Types.ObjectId,
      ref: "Competence",
    },
    relatedFormationId: {
      type: Schema.Types.ObjectId,
      ref: "Formation",
    },
  },
  {
    timestamps: true,
    collection: "goals",
  },
);

// Index pour les requêtes fréquentes
goalSchema.index({ studentId: 1, status: 1 });
goalSchema.index({ studentId: 1, deadline: 1 });
goalSchema.index({ status: 1, deadline: 1 });
goalSchema.index({ type: 1, status: 1 });
goalSchema.index({ priority: -1, deadline: 1 });

// Méthodes d'instance
goalSchema.methods.calculateProgress = function (): number {
  if (this.targetValue === 0) return 0;
  return Math.min((this.currentValue / this.targetValue) * 100, 100);
};

goalSchema.methods.isExpired = function (): boolean {
  return this.deadline < new Date() && this.status !== GoalStatus.COMPLETED;
};

goalSchema.methods.updateProgress = async function (
  increment: number,
): Promise<void> {
  this.currentValue = Math.min(this.currentValue + increment, this.targetValue);

  if (this.currentValue >= this.targetValue) {
    this.status = GoalStatus.COMPLETED;
    this.completedAt = new Date();
  }

  await this.save();
};

// Middleware pour vérifier l'expiration avant chaque requête
goalSchema.pre("find", function () {
  this.where({ status: { $ne: GoalStatus.EXPIRED } });
});

goalSchema.pre("findOne", function () {
  this.where({ status: { $ne: GoalStatus.EXPIRED } });
});

export const Goal = mongoose.model<IGoal>("Goal", goalSchema);

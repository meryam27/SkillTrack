// /src/models/gamification/activity-profile.model.ts
import mongoose, { Schema, Document } from "mongoose";

export enum ActivityType {
  LEARNING = "LEARNING",
  PRACTICE = "PRACTICE",
  PROJECT = "PROJECT",
  ASSESSMENT = "ASSESSMENT",
  COLLABORATION = "COLLABORATION",
}

export interface ISession {
  activityType: ActivityType;
  durationMinutes: number;
  startTime: Date;
  endTime: Date;
  competenceIds: mongoose.Types.ObjectId[];
  formationId?: mongoose.Types.ObjectId;
  notes?: string;
}

export interface IActivityProfile extends Document {
  studentId: mongoose.Types.ObjectId;
  totalHours: number;
  weeklyTotalHours: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityDate: Date;
  lastWeeklyReset: Date;
  sessions: ISession[];
  dailyGoalMinutes: number;
  weeklyGoalHours: number;
  level: number;
  experiencePoints: number;
}

const sessionSchema = new Schema<ISession>(
  {
    activityType: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    competenceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Competence",
      },
    ],
    formationId: {
      type: Schema.Types.ObjectId,
      ref: "Formation",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const activityProfileSchema = new Schema<IActivityProfile>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    weeklyTotalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentStreakDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreakDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
    lastWeeklyReset: {
      type: Date,
      default: () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(now.setDate(diff));
      },
    },
    sessions: [sessionSchema],
    dailyGoalMinutes: {
      type: Number,
      default: 60,
      min: 0,
    },
    weeklyGoalHours: {
      type: Number,
      default: 10,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    experiencePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "activity_profiles",
  },
);

// Index
activityProfileSchema.index({ studentId: 1 });
activityProfileSchema.index({ level: -1, experiencePoints: -1 });
activityProfileSchema.index({ currentStreakDays: -1 });
activityProfileSchema.index({ totalHours: -1 });
activityProfileSchema.index({ lastActivityDate: -1 });

// Méthodes d'instance
activityProfileSchema.methods.addSession = async function (
  session: Partial<ISession>,
): Promise<void> {
  this.sessions.push(session as ISession);
  this.totalHours += session.durationMinutes! / 60;
  this.weeklyTotalHours += session.durationMinutes! / 60;
  this.lastActivityDate = session.endTime!;

  // Calculer XP
  const xpGained = Math.floor(session.durationMinutes! * 2);
  this.experiencePoints += xpGained;

  // Calculer le niveau (exemple: 100 XP par niveau)
  this.level = Math.floor(this.experiencePoints / 100) + 1;

  // Mettre à jour le streak
  await this.updateStreak();

  await this.save();
};

activityProfileSchema.methods.updateStreak = async function (): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = new Date(this.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastActivity.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Activité aujourd'hui, streak continue
    return;
  } else if (diffDays === 1) {
    // Activité hier, incrémenter le streak
    this.currentStreakDays += 1;
    if (this.currentStreakDays > this.longestStreakDays) {
      this.longestStreakDays = this.currentStreakDays;
    }
  } else {
    // Streak cassé
    this.currentStreakDays = 1;
  }
};

activityProfileSchema.methods.resetWeeklyStats =
  async function (): Promise<void> {
    this.weeklyTotalHours = 0;
    this.lastWeeklyReset = new Date();
    await this.save();
  };

export const ActivityProfile = mongoose.model<IActivityProfile>(
  "ActivityProfile",
  activityProfileSchema,
);

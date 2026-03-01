// /src/models/analytics/statistics-report.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IStatisticsReport extends Document {
  institutionId: string;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
  totalStudents: number;
  activeStudents: number;
  totalAlumni: number;
  newRegistrations: number;
  averageSessionDuration: number;
  totalLearningHours: number;
  competencesAcquired: number;
  projectsCompleted: number;

  // Données agrégées
  statsByFiliere: Map<
    string,
    {
      students: number;
      averageProgress: number;
      competencesAcquired: number;
    }
  >;

  // Méthadonnéestriques
  period: string;
}

const statsByFiliereSchema = new Schema(
  {
    students: { type: Number, default: 0 },
    averageProgress: { type: Number, default: 0 },
    competencesAcquired: { type: Number, default: 0 },
  },
  { _id: false },
);

const statisticsReportSchema = new Schema<IStatisticsReport>(
  {
    institutionId: {
      type: String,
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    activeStudents: {
      type: Number,
      default: 0,
    },
    totalAlumni: {
      type: Number,
      default: 0,
    },
    newRegistrations: {
      type: Number,
      default: 0,
    },
    averageSessionDuration: {
      type: Number,
      default: 0,
    },
    totalLearningHours: {
      type: Number,
      default: 0,
    },
    competencesAcquired: {
      type: Number,
      default: 0,
    },
    projectsCompleted: {
      type: Number,
      default: 0,
    },
    statsByFiliere: {
      type: Map,
      of: statsByFiliereSchema,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "statistics_reports",
  },
);

// Index
statisticsReportSchema.index({ institutionId: 1, periodStart: -1 });
statisticsReportSchema.index({ generatedAt: -1 });

// Champ virtuel pour la période
statisticsReportSchema.virtual("period").get(function () {
  return `${this.periodStart.toISOString().split("T")[0]} to ${this.periodEnd.toISOString().split("T")[0]}`;
});

statisticsReportSchema.set("toJSON", { virtuals: true });
statisticsReportSchema.set("toObject", { virtuals: true });

export const StatisticsReport = mongoose.model<IStatisticsReport>(
  "StatisticsReport",
  statisticsReportSchema,
);

import mongoose, { Schema, type Document } from "mongoose";

export interface IActivitySession {
  session_id: mongoose.Types.ObjectId;
  start_time: Date;
  end_time: Date;
  duration_minutes: number; // Durée en minutes
  activity_type: "learning" | "practice" | "assessment" | "community";
  skill_id?: mongoose.Types.ObjectId; // Optionnel: compétence travaillée
}

export interface IActivityProfile extends Document {
  user_id: mongoose.Types.ObjectId;
  // TEMPS TOTAL D'ACTIVITÉ
  total_hours: number; // Heures totales accumulées
  total_minutes: number; // Minutes totales (précis)

  // STATISTIQUES TEMPORELLES
  daily_average_minutes: number; // Moyenne quotidienne (7 derniers jours)
  weekly_total_hours: number; // Total cette semaine
  monthly_total_hours: number; // Total ce mois

  // SESSIONS DÉTAILLÉES
  sessions: IActivitySession[]; // Historique des sessions
  current_session?: {
    // Session en cours (si active)
    start_time: Date;
    activity_type: string;
  };

  // MÉTRIQUES DE FRÉQUENCE
  days_active: number; // Nombre total de jours avec activité
  current_streak_days: number; // Jours consécutifs avec activité
  longest_streak_days: number; // Record de jours consécutifs

  // CLASSEMENT
  leaderboard_position?: number; // Position dans le classement global

  // TIMESTAMPS
  last_activity_date: Date; // Dernière activité
  last_weekly_reset: Date; // Dernière réinitialisation hebdo
  last_monthly_reset: Date; // Dernière réinitialisation mensuelle
  createdAt: Date;
  updatedAt: Date;
}

const activitySessionSchema = new Schema<IActivitySession>(
  {
    session_id: { type: Schema.Types.ObjectId, auto: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    duration_minutes: { type: Number, required: true, min: 1 },
    activity_type: {
      type: String,
      enum: ["learning", "practice", "assessment", "community"],
      required: true,
    },
    skill_id: { type: Schema.Types.ObjectId, ref: "Skill" },
  },
  { _id: false } // Pas d'_id séparé, utilise session_id
);

const activityProfileSchema = new Schema<IActivityProfile>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Temps total
    total_hours: { type: Number, default: 0, min: 0 },
    total_minutes: { type: Number, default: 0, min: 0 },

    // Statistiques temporelles
    daily_average_minutes: { type: Number, default: 0, min: 0 },
    weekly_total_hours: { type: Number, default: 0, min: 0 },
    monthly_total_hours: { type: Number, default: 0, min: 0 },

    // Sessions
    sessions: [activitySessionSchema],
    current_session: {
      start_time: Date,
      activity_type: String,
    },

    // Fréquence
    days_active: { type: Number, default: 0, min: 0 },
    current_streak_days: { type: Number, default: 0, min: 0 },
    longest_streak_days: { type: Number, default: 0, min: 0 },

    // Classement
    leaderboard_position: { type: Number, min: 1 },

    // Dates importantes
    last_activity_date: Date,
    last_weekly_reset: { type: Date, default: Date.now },
    last_monthly_reset: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// INDEXES pour performances
activityProfileSchema.index({ user_id: 1 });
activityProfileSchema.index({ total_hours: -1 }); // Classement global
activityProfileSchema.index({ weekly_total_hours: -1 }); // Classement hebdo
activityProfileSchema.index({ monthly_total_hours: -1 }); // Classement mensuel
activityProfileSchema.index({ current_streak_days: -1 }); // Streak leaderboard
activityProfileSchema.index({ last_activity_date: -1 }); // Actifs récemment

// MIDDLEWARE: Mettre à jour total_hours automatiquement
activityProfileSchema.pre("save", function (next) {
  // Convertir total_minutes en heures pour total_hours
  this.total_hours = Math.floor(this.total_minutes / 60);
});

export const ActivityProfile = mongoose.model<IActivityProfile>(
  "ActivityProfile",
  activityProfileSchema
);

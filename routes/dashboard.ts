// /src/routes/dashboard.ts
import { Router, Request, Response } from "express";
import { Student } from "../models/core/student.model";
import { ActivityProfile } from "../models/gamification/activity-profile.model";
import { StudentCompetence } from "../models/competences/student.competance.model";
import { Goal } from "../models/gamification/goal.model";
import { Achievement } from "../models/gamification/achievement.model";
import { protect } from "../middleware/authMiddleware";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const router = Router();

// Appliquer le middleware de protection sur toutes les routes du dashboard
router.use(protect);

/**
 * GET /dashboard
 * Récupère toutes les données du tableau de bord pour l'étudiant connecté
 */
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // 1. Récupérer l'étudiant
    const student = await Student.findById(studentId).populate("filiereId");

    if (!student) {
      return res.status(404).json({ error: "Étudiant non trouvé" });
    }

    // 2. Récupérer ou créer le profil d'activité
    let activityProfile = await ActivityProfile.findOne({ studentId });

    if (!activityProfile) {
      activityProfile = await ActivityProfile.create({
        studentId,
        totalHours: 0,
        weeklyTotalHours: 0,
        currentStreakDays: 0,
        longestStreakDays: 0,
        sessions: [],
        level: 1,
        experiencePoints: 0,
      });
    }

    // 3. Compter les compétences acquises
    const skillsAcquiredCount = await StudentCompetence.countDocuments({
      studentId,
      status: { $in: ["ACQUIRED", "VALIDATED"] },
    });

    // 4. Récupérer les sessions récentes (4 dernières)
    const recentSessions = activityProfile.sessions
      .slice(-4)
      .reverse()
      .map((session) => ({
        type:
          session.activityType === "LEARNING"
            ? "course_completed"
            : "skill_practiced",
        details: `Session de ${session.activityType.toLowerCase()} (${session.durationMinutes} min)`,
        date: session.endTime,
        xpGained: Math.floor(session.durationMinutes * 2),
      }));

    // 5. Récupérer les objectifs actifs
    const goals = await Goal.find({
      studentId,
      status: "ACTIVE",
    })
      .sort({ priority: -1, deadline: 1 })
      .limit(5);

    // 6. Récupérer les succès récents (6 derniers)
    const achievements = await Achievement.find({ studentId })
      .sort({ unlockedAt: -1 })
      .limit(6);

    // 7. Construire le leaderboard (top 5 étudiants)
    interface PopulatedStudent {
      _id: any;
      firstName: string;
      lastName: string;
    }

    const leaderboardDocs = await ActivityProfile.find()
      .sort({ totalHours: -1 })
      .limit(5)
      .populate("studentId", "firstName lastName");

    const leaderboardData = leaderboardDocs.map((doc, index) => {
      const studentData = doc.studentId as unknown as PopulatedStudent;
      return {
        name: `${studentData.firstName} ${studentData.lastName}`,
        level: doc.level,
        xp: doc.experiencePoints,
        totalHours: doc.totalHours,
        rank: index + 1,
      };
    });

    // 8. Calculer la progression hebdomadaire
    const weeklyProgress = {
      weekStart: activityProfile.lastWeeklyReset,
      dailyHours: calculateDailyHours(activityProfile.sessions),
      totalHours: activityProfile.weeklyTotalHours,
      skillsAdded: 0, // À calculer si nécessaire
      coursesCompleted: recentSessions.filter(
        (s) => s.type === "course_completed",
      ).length,
    };

    // 9. Générer des insights AI (exemples)
    const aiInsights = generateAIInsights(activityProfile, skillsAcquiredCount);

    // 10. Construire la réponse
    res.json({
      user: {
        name: `${student.firstName} ${student.lastName}`,
        level: activityProfile.level,
        xp: activityProfile.experiencePoints,
        streakDays: activityProfile.currentStreakDays,
        totalLearningHours: activityProfile.totalHours,
        skillsAcquiredCount,
        globalProgress: calculateGlobalProgress(
          activityProfile.totalHours,
          skillsAcquiredCount,
        ),
      },
      goals: goals.map((g) => ({
        id: g._id,
        title: g.title,
        target: g.targetValue,
        current: g.currentValue,
        progress: g.calculateProgress(),
        deadline: g.deadline.toISOString().split("T")[0],
        priority: g.priority,
        type: g.type,
      })),
      achievements: achievements.map((a) => ({
        id: a._id,
        name: a.name,
        rarity: a.rarity,
        icon: a.icon,
        description: a.description,
        category: a.category,
        unlockedAt: a.unlockedAt,
      })),
      recentActivity: recentSessions,
      weeklyProgress,
      leaderboard: leaderboardData,
      aiInsights,
    });
  } catch (err: any) {
    console.error("Dashboard error:", err);
    res.status(500).json({
      error: "Échec du chargement du tableau de bord",
      details: err.message,
    });
  }
});

/**
 * Calcule les heures par jour de la semaine
 */
function calculateDailyHours(sessions: any[]): Record<string, number> {
  const dailyHours = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Filtrer les sessions de la semaine en cours
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Lundi
  weekStart.setHours(0, 0, 0, 0);

  sessions
    .filter((session) => new Date(session.startTime) >= weekStart)
    .forEach((session) => {
      const day = dayMap[new Date(session.startTime).getDay()];
      dailyHours[day as keyof typeof dailyHours] +=
        session.durationMinutes / 60;
    });

  return dailyHours;
}

/**
 * Génère des insights AI basés sur l'activité de l'étudiant
 */
function generateAIInsights(profile: any, skillsCount: number): string[] {
  const insights: string[] = [];

  // Insight sur la progression
  const progressRate = Math.floor(Math.random() * 30) + 10;
  insights.push(
    `Vous progressez ${progressRate}% plus vite que la moyenne cette semaine !`,
  );

  // Insight sur les compétences
  if (skillsCount > 0) {
    insights.push(`Vous avez acquis ${skillsCount} compétence(s) au total.`);
  }

  // Insight sur le streak
  if (profile.currentStreakDays >= 7) {
    insights.push(
      `Excellent ! Vous maintenez votre série depuis ${profile.currentStreakDays} jours 🔥`,
    );
  }

  // Insight sur les recommandations
  const recommendedCourses = Math.floor(Math.random() * 5) + 1;
  insights.push(
    `${recommendedCourses} nouveau(x) cours correspondent à votre profil.`,
  );

  return insights.slice(0, 3); // Limiter à 3 insights
}

/**
 * Calcule le progrès global de l'étudiant
 */
function calculateGlobalProgress(
  totalHours: number,
  skillsCount: number,
): number {
  // Formule: 50% basé sur les heures, 50% sur les compétences acquises
  const hoursProgress = Math.min((totalHours / 200) * 50, 50);
  const skillsProgress = Math.min((skillsCount / 20) * 50, 50);

  return Math.floor(hoursProgress + skillsProgress);
}

export default router;

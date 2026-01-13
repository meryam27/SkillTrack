// src/routes/dashboard.js
import { Router } from "express";
import mongoose from "mongoose";

import { User } from "../models/User.js";
import { ActivityProfile } from "../models/Activity.js";
import { UserSkill } from "../models/UserSkill.js";
import { Goal } from "../models/Goal.js";
import { Achievement } from "../models/Achievement.js";

const router = Router();

// ⚠️ TEMP: ID utilisateur de test
const TEST_USER_ID = "696523a92183e44e20d5f16a";

router.get("/", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(TEST_USER_ID);

    const user = await User.findById(userId);
    const activityProfile = await ActivityProfile.findOne({ user_id: userId });

    if (!user || !activityProfile) {
      return res
        .status(404)
        .json({ error: "User or activity profile not found" });
    }

    const skillsAcquiredCount = await UserSkill.countDocuments({
      user_id: userId,
    });

    const recentSessions = activityProfile.sessions
      .slice(-4)
      .reverse()
      .map((session) => ({
        type:
          session.activity_type === "learning"
            ? "course_completed"
            : "skill_practiced",
        details: `Session de ${session.activity_type} (${session.duration_minutes} min)`,
        date: session.end_time,
        xpGained: Math.floor(session.duration_minutes * 2),
      }));

    const goals = await Goal.find({
      user_id: userId,
      status: "active",
    });

    const achievements = await Achievement.find({ user_id: userId })
      .sort({ unlocked_at: -1 })
      .limit(6);

    // 🔥 Leaderboard
    const leaderboardDocs = await ActivityProfile.find()
      .sort({ total_hours: -1 })
      .limit(5)
      .populate("user_id", "firstName lastName")
      .exec();

    const leaderboardData = leaderboardDocs.map((doc, index) => ({
      name: `${doc.user_id.firstName} ${doc.user_id.lastName}`,
      level: Math.floor(doc.total_hours / 10) || 1,
      xp: doc.total_hours * 100,
      rank: index + 1,
    }));

    const weeklyProgress = {
      weekStart: activityProfile.last_weekly_reset,
      dailyHours: {
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0,
      },
      totalHours: activityProfile.weekly_total_hours,
      skillsAdded: 0,
      coursesCompleted: recentSessions.filter(
        (s) => s.type === "course_completed"
      ).length,
    };

    const aiInsights = [
      `Vous progressez ${
        Math.floor(Math.random() * 30) + 10
      }% plus vite que la moyenne cette semaine !`,
      "3 nouveaux cours correspondent à votre profil.",
    ];

    res.json({
      user: {
        name: `${user.firstName} ${user.lastName}`,
        level: Math.floor(activityProfile.total_hours / 10) || 1,
        xp: activityProfile.total_hours * 100,
        streakDays: activityProfile.current_streak_days,
        totalLearningHours: activityProfile.total_hours,
        skillsAcquiredCount,
        globalProgress: Math.min(
          100,
          Math.floor((activityProfile.total_hours / 200) * 100)
        ),
      },
      goals: goals.map((g) => ({
        title: g.title,
        target: g.target_value,
        current: g.current_value,
        deadline: g.deadline.toISOString().split("T")[0],
      })),
      achievements: achievements.map((a) => ({
        name: a.name,
        rarity: a.rarity,
        icon: a.icon,
        description: a.description,
      })),
      recentActivity: recentSessions,
      weeklyProgress,
      leaderboard: leaderboardData,
      aiInsights,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

export default router;

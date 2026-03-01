// /src/controllers/crud-student.controller.ts
import { Request, Response } from "express";
import { Student, IStudent } from "../../models/core/student.model";
import { Filiere } from "../../models/core/filiere.model";
import { ActivityProfile } from "../../models/gamification/activity-profile.model";
import { StudentCompetence } from "../../models/competences/student.competance.model";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, User } from "../../models/core/user.model";
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * GET /students
 * Récupérer tous les étudiants avec filtres et pagination
 */
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      niveau,
      filiereId,
      promotion,
      isActive,
      search,
    } = req.query;

    // Construction du filtre
    const filter: any = {};

    if (niveau) filter.niveau = niveau;
    if (filiereId) filter.filiereId = filiereId;
    if (promotion) filter.promotion = Number(promotion);
    if (isActive !== undefined) filter.isActive = isActive === "true";

    // Recherche textuelle
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const students = await Student.find(filter)
      .populate("filiereId", "titre description")
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      data: students,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: students.length,
        totalItems: total,
      },
    });
  } catch (err: any) {
    console.error("Error fetching students:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des étudiants",
      details: err.message,
    });
  }
};

/**
 * GET /students/:id
 * Récupérer un étudiant par son ID
//  */
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    const student = await Student.findById(id)
      .populate("filiereId", "titre description debouches")
      .populate("preferences")
      .populate("objectives")
      .select("-passwordHash");

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Étudiant non trouvé",
      });
    }

    // Récupérer les statistiques supplémentaires
    const activityProfile = await ActivityProfile.findOne({
      studentId: id,
    });

    const competencesCount = await StudentCompetence.countDocuments({
      studentId: id,
    });

    const competencesValidated = await StudentCompetence.countDocuments({
      studentId: id,
      status: "VALIDATED",
    });

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        statistics: {
          totalHours: activityProfile?.totalHours || 0,
          level: activityProfile?.level || 1,
          experiencePoints: activityProfile?.experiencePoints || 0,
          competencesCount,
          competencesValidated,
          currentStreak: activityProfile?.currentStreakDays || 0,
        },
      },
    });
  } catch (err: any) {
    console.error("Error fetching student:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'étudiant",
      details: err.message,
    });
  }
};

/**
 * POST /students
 * Créer un nouvel étudiant
 */
export const createStudent = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      filiereId,
      niveau,
      promotion,
      groupeId,
      academicEmail,
      expectedGraduation,
    } = req.body;

    // Validation des champs requis
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !filiereId ||
      !niveau ||
      !promotion
    ) {
      return res.status(400).json({
        success: false,
        error: "Tous les champs obligatoires doivent être remplis",
      });
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: "Cet email existe déjà",
      });
    }

    // Vérifier si la filière existe
    const filiere = await Filiere.findById(filiereId);
    if (!filiere) {
      return res.status(404).json({
        success: false,
        error: "Filière non trouvée",
      });
    }

    // Créer l'étudiant
    const student = await Student.create({
      email,
      passwordHash: password, // Sera hashé par le pre-save hook
      firstName,
      lastName,
      phoneNumber,
      filiereId,
      niveau,
      promotion,
      groupeId,
      academicEmail: academicEmail || email,
      inscriptionDate: new Date(),
      expectedGraduation:
        expectedGraduation || calculateExpectedGraduation(niveau),
      role: "student",
      isActive: true,
      isVerified: false,
    });

    // Créer le profil d'activité associé
    await ActivityProfile.create({
      studentId: student._id,
      totalHours: 0,
      weeklyTotalHours: 0,
      currentStreakDays: 0,
      sessions: [],
      level: 1,
      experiencePoints: 0,
    });

    // Retourner l'étudiant créé sans le mot de passe
    const createdStudent = await Student.findById(student._id)
      .populate("filiereId", "titre description")
      .select("-passwordHash");

    res.status(201).json({
      success: true,
      message: "Étudiant créé avec succès",
      data: createdStudent,
    });
  } catch (err: any) {
    console.error("Error creating student:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de l'étudiant",
      details: err.message,
    });
  }
};

/**
 * PUT /students/:id
 * Mettre à jour un étudiant
 */
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    // Empêcher la modification de certains champs sensibles
    delete updateData.passwordHash;
    delete updateData.role;
    delete updateData.createdAt;

    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updateData.email) {
      const existingEmail = await Student.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          error: "Cet email est déjà utilisé par un autre étudiant",
        });
      }
    }

    // Si la filière est modifiée, vérifier qu'elle existe
    if (updateData.filiereId) {
      const filiere = await Filiere.findById(updateData.filiereId);
      if (!filiere) {
        return res.status(404).json({
          success: false,
          error: "Filière non trouvée",
        });
      }
    }

    const student = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("filiereId", "titre description")
      .select("-passwordHash");

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Étudiant non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Étudiant mis à jour avec succès",
      data: student,
    });
  } catch (err: any) {
    console.error("Error updating student:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de l'étudiant",
      details: err.message,
    });
  }
};

/**
 * DELETE /students/:id
 * Supprimer un étudiant (soft delete)
 */
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { permanent = false } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    if (permanent === "true") {
      // Suppression permanente
      const student = await Student.findByIdAndDelete(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          error: "Étudiant non trouvé",
        });
      }

      // Supprimer également le profil d'activité et les données associées
      await ActivityProfile.deleteOne({ studentId: id });
      await StudentCompetence.deleteMany({ studentId: id });

      res.json({
        success: true,
        message: "Étudiant supprimé définitivement",
      });
    } else {
      // Soft delete (désactivation)
      const student = await Student.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true },
      ).select("-passwordHash");

      if (!student) {
        return res.status(404).json({
          success: false,
          error: "Étudiant non trouvé",
        });
      }

      res.json({
        success: true,
        message: "Étudiant désactivé avec succès",
        data: student,
      });
    }
  } catch (err: any) {
    console.error("Error deleting student:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de l'étudiant",
      details: err.message,
    });
  }
};

/**
 * PATCH /students/:id/activate
 * Activer/Désactiver un étudiant
 */
export const toggleStudentStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Étudiant non trouvé",
      });
    }

    student.isActive = !student.isActive;
    await student.save();

    const updatedStudent = await Student.findById(id)
      .populate("filiereId", "titre description")
      .select("-passwordHash");

    res.json({
      success: true,
      message: `Étudiant ${student.isActive ? "activé" : "désactivé"} avec succès`,
      data: updatedStudent,
    });
  } catch (err: any) {
    console.error("Error toggling student status:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors du changement de statut",
      details: err.message,
    });
  }
};

/**
 * POST /students/:id/reset-password
 * Réinitialiser le mot de passe d'un étudiant
 */
export const resetStudentPassword = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { newPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Étudiant non trouvé",
      });
    }

    // Hash le nouveau mot de passe
    student.passwordHash = await bcrypt.hash(newPassword, 10);
    await student.save();

    res.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (err: any) {
    console.error("Error resetting password:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la réinitialisation du mot de passe",
      details: err.message,
    });
  }
};

/**
 * GET /students/:id/statistics
 * Récupérer les statistiques détaillées d'un étudiant
 */
export const getStudentStatistics = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Étudiant non trouvé",
      });
    }

    const activityProfile = await ActivityProfile.findOne({ studentId: id });

    const competences = await StudentCompetence.find({ studentId: id });

    const competencesByStatus = {
      toAcquire: competences.filter((c) => c.status === "TO_ACQUIRE").length,
      inProgress: competences.filter((c) => c.status === "IN_PROGRESS").length,
      acquired: competences.filter((c) => c.status === "ACQUIRED").length,
      validated: competences.filter((c) => c.status === "VALIDATED").length,
    };

    const averageConfidence =
      competences.length > 0
        ? competences.reduce((sum, c) => sum + c.confidenceScore, 0) /
          competences.length
        : 0;

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.getFullName(),
          niveau: student.niveau,
          promotion: student.promotion,
        },
        activity: {
          totalHours: activityProfile?.totalHours || 0,
          weeklyHours: activityProfile?.weeklyTotalHours || 0,
          currentStreak: activityProfile?.currentStreakDays || 0,
          longestStreak: activityProfile?.longestStreakDays || 0,
          level: activityProfile?.level || 1,
          experiencePoints: activityProfile?.experiencePoints || 0,
        },
        competences: {
          total: competences.length,
          byStatus: competencesByStatus,
          averageConfidence: Math.round(averageConfidence * 100),
          totalHoursInvested: competences.reduce(
            (sum, c) => sum + c.hoursInvested,
            0,
          ),
          totalProjectsCompleted: competences.reduce(
            (sum, c) => sum + c.projectsCompleted,
            0,
          ),
        },
      },
    });
  } catch (err: any) {
    console.error("Error fetching statistics:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des statistiques",
      details: err.message,
    });
  }
};

/**
 * Fonction helper pour calculer la date de graduation attendue
 */
function calculateExpectedGraduation(niveau: string): Date {
  const now = new Date();
  const graduationYear = now.getFullYear();

  switch (niveau) {
    case "L1":
      return new Date(graduationYear + 3, 5, 30); // Juin dans 3 ans
    case "L2":
      return new Date(graduationYear + 2, 5, 30); // Juin dans 2 ans
    case "L3":
      return new Date(graduationYear + 1, 5, 30); // Juin dans 1 an
    case "M1":
      return new Date(graduationYear + 2, 5, 30); // Juin dans 2 ans
    case "M2":
      return new Date(graduationYear + 1, 5, 30); // Juin dans 1 an
    case "Doctorat":
      return new Date(graduationYear + 3, 5, 30); // Juin dans 3 ans
    default:
      return new Date(graduationYear + 1, 5, 30);
  }
}

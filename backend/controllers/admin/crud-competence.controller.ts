// /src/controllers/crud-competence.controller.ts
import { Request, Response } from "express";
import {
  Competence,
  ICompetence,
} from "../../models/competences/competence.model";
import { StudentCompetence } from "../../models/competences/student.competance.model";
import { Formation } from "../../models/learning/formation.model";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * GET /competences
 * Récupérer toutes les compétences avec filtres et pagination
 */
export const getAllCompetences = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      domain,
      level,
      institutionId,
      search,
      sortBy = "popularityScore",
      order = "desc",
    } = req.query;

    // Construction du filtre
    const filter: any = {};

    if (category) filter.category = category;
    if (domain) filter.domain = domain;
    if (level) filter.level = level;
    if (institutionId) filter.institutionId = institutionId;

    // Recherche textuelle
    if (search) {
      filter.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Construction du tri
    const sortOptions: any = {};
    sortOptions[sortBy as string] = order === "asc" ? 1 : -1;

    const competences = await Competence.find(filter)
      .populate("prerequisites", "code name level")
      .populate("nextCompetences", "code name level")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Competence.countDocuments(filter);

    res.json({
      success: true,
      data: competences,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: competences.length,
        totalItems: total,
      },
    });
  } catch (err: any) {
    console.error("Error fetching competences:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des compétences",
      details: err.message,
    });
  }
};

/**
 * GET /competences/:id
 * Récupérer une compétence par son ID
 */
export const getCompetenceById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    const competence = await Competence.findById(id)
      .populate("prerequisites", "code name level description")
      .populate("nextCompetences", "code name level description");

    if (!competence) {
      return res.status(404).json({
        success: false,
        error: "Compétence non trouvée",
      });
    }

    // Récupérer les formations associées
    const formations = await Formation.find({
      coveredCompetences: id,
    }).select("title type platform level estimatedHours isCertified");

    // Récupérer les statistiques d'acquisition
    const totalStudents = await StudentCompetence.countDocuments({
      competenceId: id,
    });

    const acquiredCount = await StudentCompetence.countDocuments({
      competenceId: id,
      status: { $in: ["ACQUIRED", "VALIDATED"] },
    });

    const averageLevel = await StudentCompetence.aggregate([
      { $match: { competenceId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          avgSelfAssessed: { $avg: "$selfAssessedLevel" },
          avgValidated: { $avg: "$validatedLevel" },
          avgConfidence: { $avg: "$confidenceScore" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        ...competence.toObject(),
        relatedFormations: formations,
        statistics: {
          totalStudents,
          acquiredCount,
          acquisitionRate:
            totalStudents > 0 ? (acquiredCount / totalStudents) * 100 : 0,
          averageMetrics: averageLevel[0] || {
            avgSelfAssessed: 0,
            avgValidated: 0,
            avgConfidence: 0,
          },
        },
      },
    });
  } catch (err: any) {
    console.error("Error fetching competence:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de la compétence",
      details: err.message,
    });
  }
};

/**
 * POST /competences
 * Créer une nouvelle compétence
 */
export const createCompetence = async (req: Request, res: Response) => {
  try {
    const {
      code,
      institutionId,
      name,
      description,
      detailedDescription,
      category,
      domain,
      tags,
      level,
      estimatedHours,
      passingScore,
      minProjectsRequired,
      prerequisites,
      nextCompetences,
    } = req.body;

    // Validation des champs requis
    if (
      !code ||
      !institutionId ||
      !name ||
      !description ||
      !category ||
      !domain ||
      !level
    ) {
      return res.status(400).json({
        success: false,
        error: "Tous les champs obligatoires doivent être remplis",
      });
    }

    // Vérifier si le code existe déjà pour cette institution
    const existingCompetence = await Competence.findOne({
      code: code.toUpperCase(),
      institutionId,
    });

    if (existingCompetence) {
      return res.status(409).json({
        success: false,
        error: "Une compétence avec ce code existe déjà pour cette institution",
      });
    }

    // Vérifier que les prérequis existent
    if (prerequisites && prerequisites.length > 0) {
      const prereqCount = await Competence.countDocuments({
        _id: { $in: prerequisites },
      });

      if (prereqCount !== prerequisites.length) {
        return res.status(400).json({
          success: false,
          error: "Certains prérequis n'existent pas",
        });
      }
    }

    // Créer la compétence
    const competence = await Competence.create({
      code: code.toUpperCase(),
      institutionId,
      name,
      description,
      detailedDescription,
      category,
      domain,
      tags: tags || [],
      level,
      estimatedHours: estimatedHours || 0,
      popularityScore: 0,
      passingScore: passingScore || 70,
      minProjectsRequired: minProjectsRequired || 1,
      prerequisites: prerequisites || [],
      nextCompetences: nextCompetences || [],
    });

    // Mettre à jour les nextCompetences des prérequis
    if (prerequisites && prerequisites.length > 0) {
      await Competence.updateMany(
        { _id: { $in: prerequisites } },
        { $addToSet: { nextCompetences: competence._id } },
      );
    }

    const createdCompetence = await Competence.findById(competence._id)
      .populate("prerequisites", "code name level")
      .populate("nextCompetences", "code name level");

    res.status(201).json({
      success: true,
      message: "Compétence créée avec succès",
      data: createdCompetence,
    });
  } catch (err: any) {
    console.error("Error creating competence:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de la compétence",
      details: err.message,
    });
  }
};

/**
 * PUT /competences/:id
 * Mettre à jour une compétence
 */
export const updateCompetence = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    // Empêcher la modification de certains champs
    delete updateData.code; // Le code ne doit pas être modifiable
    delete updateData.institutionId;
    delete updateData.createdAt;
    delete updateData.popularityScore; // Calculé automatiquement

    // Si le code est dans updateData (même logique), vérifier l'unicité
    if (updateData.code) {
      const existingCompetence = await Competence.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: id },
      });

      if (existingCompetence) {
        return res.status(409).json({
          success: false,
          error: "Une compétence avec ce code existe déjà",
        });
      }
    }

    // Vérifier que les prérequis existent
    if (updateData.prerequisites && updateData.prerequisites.length > 0) {
      const prereqCount = await Competence.countDocuments({
        _id: { $in: updateData.prerequisites },
      });

      if (prereqCount !== updateData.prerequisites.length) {
        return res.status(400).json({
          success: false,
          error: "Certains prérequis n'existent pas",
        });
      }
    }

    const competence = await Competence.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("prerequisites", "code name level")
      .populate("nextCompetences", "code name level");

    if (!competence) {
      return res.status(404).json({
        success: false,
        error: "Compétence non trouvée",
      });
    }

    res.json({
      success: true,
      message: "Compétence mise à jour avec succès",
      data: competence,
    });
  } catch (err: any) {
    console.error("Error updating competence:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de la compétence",
      details: err.message,
    });
  }
};

/**
 * DELETE /competences/:id
 * Supprimer une compétence
 */
export const deleteCompetence = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    // Vérifier si la compétence est utilisée par des étudiants
    const studentCompetenceCount = await StudentCompetence.countDocuments({
      competenceId: id,
    });

    if (studentCompetenceCount > 0) {
      return res.status(409).json({
        success: false,
        error: `Cette compétence est utilisée par ${studentCompetenceCount} étudiant(s). Suppression impossible.`,
      });
    }

    // Vérifier si elle est prérequis pour d'autres compétences
    const dependentCompetences = await Competence.countDocuments({
      prerequisites: id,
    });

    if (dependentCompetences > 0) {
      return res.status(409).json({
        success: false,
        error: `Cette compétence est prérequis pour ${dependentCompetences} autre(s) compétence(s). Suppression impossible.`,
      });
    }

    const competence = await Competence.findByIdAndDelete(id);

    if (!competence) {
      return res.status(404).json({
        success: false,
        error: "Compétence non trouvée",
      });
    }

    // Nettoyer les références dans nextCompetences d'autres compétences
    await Competence.updateMany(
      { nextCompetences: id },
      { $pull: { nextCompetences: id } },
    );

    res.json({
      success: true,
      message: "Compétence supprimée avec succès",
    });
  } catch (err: any) {
    console.error("Error deleting competence:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de la compétence",
      details: err.message,
    });
  }
};

/**
 * GET /competences/:id/students
 * Récupérer les étudiants qui travaillent sur cette compétence
 */
export const getCompetenceStudents = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    const filter: any = { competenceId: id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const studentCompetences = await StudentCompetence.find(filter)
      .populate("studentId", "firstName lastName email niveau promotion")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await StudentCompetence.countDocuments(filter);

    res.json({
      success: true,
      data: studentCompetences.map((sc) => ({
        student: sc.studentId,
        status: sc.status,
        selfAssessedLevel: sc.selfAssessedLevel,
        validatedLevel: sc.validatedLevel,
        confidenceScore: sc.confidenceScore,
        hoursInvested: sc.hoursInvested,
        projectsCompleted: sc.projectsCompleted,
        startedAt: sc.startedAt,
        completedAt: sc.completedAt,
        lastPracticed: sc.lastPracticed,
      })),
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: studentCompetences.length,
        totalItems: total,
      },
    });
  } catch (err: any) {
    console.error("Error fetching competence students:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des étudiants",
      details: err.message,
    });
  }
};

/**
 * PATCH /competences/:id/popularity
 * Mettre à jour le score de popularité d'une compétence
 */
export const updateCompetencePopularity = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
      });
    }

    // Calculer le score de popularité basé sur le nombre d'étudiants
    const studentsCount = await StudentCompetence.countDocuments({
      competenceId: id,
    });

    const acquiredCount = await StudentCompetence.countDocuments({
      competenceId: id,
      status: { $in: ["ACQUIRED", "VALIDATED"] },
    });

    // Formule de popularité: nombre total d'étudiants + bonus pour les acquisitions
    const popularityScore = studentsCount + acquiredCount * 2;

    const competence = await Competence.findByIdAndUpdate(
      id,
      { popularityScore },
      { new: true },
    );

    if (!competence) {
      return res.status(404).json({
        success: false,
        error: "Compétence non trouvée",
      });
    }

    res.json({
      success: true,
      message: "Score de popularité mis à jour",
      data: {
        competenceId: id,
        popularityScore,
        studentsCount,
        acquiredCount,
      },
    });
  } catch (err: any) {
    console.error("Error updating popularity:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de la popularité",
      details: err.message,
    });
  }
};

/**
 * GET /competences/categories
 * Récupérer toutes les catégories de compétences
 */
export const getCompetenceCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Competence.distinct("category");
    const domains = await Competence.distinct("domain");

    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Competence.countDocuments({ category });
        return { category, count };
      }),
    );

    const domainsWithCount = await Promise.all(
      domains.map(async (domain) => {
        const count = await Competence.countDocuments({ domain });
        return { domain, count };
      }),
    );

    res.json({
      success: true,
      data: {
        categories: categoriesWithCount,
        domains: domainsWithCount,
      },
    });
  } catch (err: any) {
    console.error("Error fetching categories:", err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des catégories",
      details: err.message,
    });
  }
};

// /src/routes/crud-competence.routes.ts
import { Router } from "express";
import {
  getAllCompetences,
  getCompetenceById,
  createCompetence,
  updateCompetence,
  deleteCompetence,
  getCompetenceStudents,
  updateCompetencePopularity,
  getCompetenceCategories,
} from "../../controllers/admin/crud-competence.controller";
import { protect, restrictTo } from "../../middleware/authMiddleware";

const router = Router();

/**
 * Routes publiques ou avec authentification basique
 */

// Toutes les routes nécessitent une authentification
router.use(protect);

/**
 * Routes accessibles à tous les utilisateurs authentifiés
 */

// GET /competences - Récupérer toutes les compétences (avec filtres et pagination)
router.get("/", getAllCompetences);

// GET /competences/categories - Récupérer les catégories et domaines
router.get("/categories", getCompetenceCategories);

// GET /competences/:id - Récupérer une compétence spécifique
router.get("/:id", getCompetenceById);

// GET /competences/:id/students - Récupérer les étudiants travaillant sur une compétence
router.get("/:id/students", getCompetenceStudents);

/**
 * Routes réservées aux administrateurs et coordinateurs
 */

// POST /competences - Créer une nouvelle compétence
router.post("/create", restrictTo("admin", "coordinator"), createCompetence);

// PUT /competences/:id - Mettre à jour une compétence
router.put("/:id", restrictTo("admin", "coordinator"), updateCompetence);

// DELETE /competences/:id - Supprimer une compétence
router.delete("/:id", restrictTo("admin"), deleteCompetence);

// PATCH /competences/:id/popularity - Mettre à jour le score de popularité
router.patch(
  "/:id/popularity",
  restrictTo("admin", "coordinator"),
  updateCompetencePopularity,
);

export default router;

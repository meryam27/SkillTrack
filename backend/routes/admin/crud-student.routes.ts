// /src/routes/crud-student.routes.ts
import { Router } from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
  resetStudentPassword,
  getStudentStatistics,
} from "../../controllers/admin/crud-student.controller";
import { protect, restrictTo } from "../../middleware/authMiddleware";

const router = Router();

/**
 * Routes publiques ou avec authentification basique
 */

// Toutes les routes nécessitent une authentification
router.use(protect);

/**
 * Routes pour les administrateurs
 */

// GET /students - Récupérer tous les étudiants (avec filtres et pagination)
router.get("/", restrictTo("admin", "coordinator"), getAllStudents);

// POST /students - Créer un nouvel étudiant
router.post("/create", restrictTo("admin", "coordinator"), createStudent);

// /**
//  * Routes pour les étudiants et administrateurs
//  */

// // GET /students/:id - Récupérer un étudiant spécifique
router.get("/:id", getStudentById);

// // GET /students/:id/statistics - Récupérer les statistiques d'un étudiant
router.get("/:id/statistics", getStudentStatistics);

// /**
//  * Routes réservées aux administrateurs
//  */

// PUT /students/:id - Mettre à jour un étudiant
router.put("/:id", restrictTo("admin", "coordinator"), updateStudent);

// // DELETE /students/:id - Supprimer un étudiant (soft ou hard delete)
router.delete("/:id", restrictTo("admin"), deleteStudent);

// // PATCH /students/:id/activate - Activer/Désactiver un étudiant
router.patch(
  "/:id/activate",
  restrictTo("admin", "coordinator"),
  toggleStudentStatus,
);

// POST /students/:id/reset-password - Réinitialiser le mot de passe
router.post("/:id/reset-password", restrictTo("admin"), resetStudentPassword);

export default router;

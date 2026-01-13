import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middleware de base
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de test de base
app.get("/", (req, res) => {
  res.json({
    message: "API Backend fonctionnelle",
    timestamp: new Date().toISOString(),
    database: "MongoDB",
    status: "operational",
  });
});

// Route de santé
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default app;

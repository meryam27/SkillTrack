import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/database";
import dashboardRoutes from "./routes/dashboard";
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/admin/crud-student.routes";
import competenceRoutes from "./routes/admin/crud-competence.routes";
const app = express();
const PORT = process.env.PORT || 5000;
// Connexion à la base de données
connectDB();
// Middleware pour lire le JSON
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/api/auth", authRoutes);
// les routes pour competances

app.use("/api/admin/competences", competenceRoutes);
// les routes pour crud des students
app.use("/api/admin/students", studentRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

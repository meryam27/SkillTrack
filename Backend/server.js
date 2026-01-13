import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à MongoDB
    await connectDB();

    // Lancer le serveur
    const server = app.listen(PORT, () => {
      console.log(` Serveur démarré sur http://localhost:${PORT}`);
      console.log(` Environnement: ${process.env.NODE_ENV || "development"}`);
      console.log(` Base de données: ${process.env.MONGODB_URI}`);
    });
  } catch (error) {
    console.error("Erreur au démarrage:", error);
    process.exit(1);
  }
};

// Démarrer l'application
startServer();

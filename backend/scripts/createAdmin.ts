import mongoose from "mongoose";
import dotenv from "dotenv";
import { Admin } from "../models/core/admin.model";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/skilltrack";

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connecté");

    // Vérifie si l'admin existe déjà
    const existingAdmin = await Admin.findOne({ email: "admin@test.com" });
    if (existingAdmin) {
      console.log("Admin existe déjà");
      process.exit(0);
    }

    const admin = new Admin({
      email: "admin@test.com",
      passwordHash: "Admin123!", // le hook du modèle User va hasher automatiquement
      firstName: "Admin",
      lastName: "Test",
      role: "admin",

      // Champs spécifiques à Admin
      department: "IT",
      adminLevel: "super",
      permissions: ["manage_users", "generate_reports"],
    });

    await admin.save();
    console.log("Admin créé avec succès !");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();

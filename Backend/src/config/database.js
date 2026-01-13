import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/testdb";

    await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB connecté: ${mongoose.connection.host}`);

    // Événements de connexion
    mongoose.connection.on("error", (err) => {
      console.error(`❌ Erreur MongoDB: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB déconnecté");
    });
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB: ${error}`);
    process.exit(1);
  }
};

export default connectDB;

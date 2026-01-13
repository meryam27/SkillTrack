
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import connectDB from './config/database';
import dashboardRoutes from './routes/dashboard';



const app = express();
const PORT = process.env.PORT || 5000;



// Middleware pour lire le JSON
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Connexion à la base de données
connectDB();

app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
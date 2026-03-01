import { Request, Response } from "express";
import { User } from "../models/core/user.model";
import jwt from "jsonwebtoken";

/* ===================== LOGIN ===================== */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ===================== REGISTER ===================== */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    const user = new User({
      email,
      passwordHash: password,
      firstName,
      lastName,
      role: "student",
    });

    await user.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

import mongoose, { Schema, type Document } from "mongoose";
// UserSkill représente la relation entre un utilisateur et une compétence spécifique, incluant le niveau actuel, la validation et les preuves associées.
// par contre Skill représente une compétence en elle-même avec ses détails, ressources d'apprentissage, et relations avec d'autres compétences.
export interface IProofOfSkill {
  type: "certificate" | "project" | "test_score" | "portfolio_item";
  title: string;
  url: string;
  verified_at?: Date;
}

export interface IUserSkill extends Document {
  user_id: mongoose.Types.ObjectId;
  skill_id: mongoose.Types.ObjectId;
  current_level: number;
  proficiency_percentage: number;
  experience_years: number;
  last_used_date?: Date;
  validation_status:
    | "self_assessed"
    | "peer_reviewed"
    | "project_validated"
    | "certification_verified";
  proof_of_skill: IProofOfSkill[];
  confidence_score: number;
  is_primary_skill: boolean;
  skill_relevance_to_goal: number;
  acquired_date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSkillSchema = new Schema<IUserSkill>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skill_id: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
    current_level: { type: Number, min: 1, max: 5, required: true },
    proficiency_percentage: { type: Number, min: 0, max: 100 },
    experience_years: { type: Number, default: 0 },
    last_used_date: Date,
    validation_status: {
      type: String,
      enum: [
        "self_assessed",
        "peer_reviewed",
        "project_validated",
        "certification_verified",
      ],
      default: "self_assessed",
    },
    proof_of_skill: [
      {
        type: {
          type: String,
          enum: ["certificate", "project", "test_score", "portfolio_item"],
        },
        title: String,
        url: String,
        verified_at: Date,
      },
    ],
    confidence_score: { type: Number, min: 0, max: 100 },
    is_primary_skill: { type: Boolean, default: false },
    skill_relevance_to_goal: { type: Number, min: 0, max: 100 },
    acquired_date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSkillSchema.index({ user_id: 1, skill_id: 1 }, { unique: true });
userSkillSchema.index({ user_id: 1, current_level: -1 });
userSkillSchema.index({ validation_status: 1 });

export const UserSkill = mongoose.model<IUserSkill>(
  "UserSkill",
  userSkillSchema
);

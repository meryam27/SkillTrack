const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSkillSchema = new Schema(
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

module.exports = mongoose.model("UserSkill", userSkillSchema);

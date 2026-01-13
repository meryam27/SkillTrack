import mongoose, { Schema, type Document } from "mongoose";

export interface IGoal extends Document {
    user_id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    target_value: number;
    current_value: number;
    unit: "hours" | "skills" | "courses" | "xp";
    deadline: Date;
    status: "active" | "completed" | "overdue";
    createdAt: Date;
    updatedAt: Date;
}

const goalSchema = new Schema<IGoal>({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    target_value: { type: Number, required: true, min: 1 },
    current_value: { type: Number, default: 0, min: 0 },
    unit: {
        type: String,
        enum: ["hours", "skills", "courses", "xp"],
        required: true
    },
    deadline: { type: Date, required: true },
    status: {
        type: String,
        enum: ["active", "completed", "overdue"],
        default: "active"
    }
}, { timestamps: true });

goalSchema.index({ user_id: 1, status: 1 });
goalSchema.index({ deadline: 1 });

export const Goal = mongoose.model<IGoal>("Goal", goalSchema);
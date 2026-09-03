import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    p: { type: mongoose.Schema.Types.Mixed, default: {} },
    v: { type: mongoose.Schema.Types.Mixed, default: {} },
    days: { type: mongoose.Schema.Types.Mixed, default: {} },
    tests: { type: [mongoose.Schema.Types.Mixed], default: [] },
    cfg: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
export const Progress = mongoose.model("Progress", progressSchema);

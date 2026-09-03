import { model, Schema, type Types } from "mongoose";
import type { ProgressStore } from "./types.js";

export interface UserDoc {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressDoc extends ProgressStore {
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true, collection: "users" },
);

const progressSchema = new Schema<ProgressDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    p: { type: Schema.Types.Mixed, default: {} },
    v: { type: Schema.Types.Mixed, default: {} },
    days: { type: Schema.Types.Mixed, default: {} },
    tests: { type: [Schema.Types.Mixed], default: [] },
    cfg: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "progress" },
);

export const User = model<UserDoc>("User", userSchema);
export const Progress = model<ProgressDoc>("Progress", progressSchema);

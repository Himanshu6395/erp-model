import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ALL_ROLES } from "../common/constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    isVerified: { type: Boolean, default: true },
    role: { type: String, enum: ALL_ROLES, required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(rawPassword) {
  return bcrypt.compare(rawPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;

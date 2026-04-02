import mongoose from "mongoose";

const loginActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null, index: true },
    email: { type: String, trim: true, default: "" },
    role: { type: String, trim: true, default: "" },
    ipAddress: { type: String, trim: true, default: "" },
    device: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["SUCCESS", "FAILED"], required: true, index: true },
    reason: { type: String, trim: true, default: "" },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

const LoginActivity = mongoose.model("LoginActivity", loginActivitySchema);
export default LoginActivity;

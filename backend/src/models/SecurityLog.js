import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    role: { type: String, trim: true, default: "" },
    ipAddress: { type: String, trim: true, default: "" },
    action: { type: String, required: true, trim: true },
    meta: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

const SecurityLog = mongoose.model("SecurityLog", securityLogSchema);
export default SecurityLog;

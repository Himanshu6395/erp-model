import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    price: { type: Number, required: true, min: 0, default: 0 },
    billingCycle: { type: String, enum: ["MONTHLY", "YEARLY"], default: "MONTHLY" },
    trialDays: { type: Number, min: 0, default: 0 },
    features: {
      attendance: { type: Boolean, default: true },
      fees: { type: Boolean, default: true },
      exam: { type: Boolean, default: true },
      transport: { type: Boolean, default: false },
      hostel: { type: Boolean, default: false },
      library: { type: Boolean, default: false },
      messaging: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
    },
    limits: {
      maxStudents: { type: Number, min: 0, default: 100 },
      maxTeachers: { type: Number, min: 0, default: 20 },
      maxStaff: { type: Number, min: 0, default: 20 },
    },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);
export default Plan;

import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true, unique: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true, index: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["ACTIVE", "EXPIRED", "TRIAL", "CANCELLED"], default: "TRIAL", index: true },
    trialDays: { type: Number, min: 0, default: 0 },
    autoRenew: { type: Boolean, default: false },
    lastRenewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;

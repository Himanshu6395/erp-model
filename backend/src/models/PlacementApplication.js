import mongoose from "mongoose";

const placementApplicationSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "PlacementJob", required: true, index: true },
    status: { type: String, enum: ["APPLIED", "SHORTLISTED", "REJECTED", "SELECTED"], default: "APPLIED" },
  },
  { timestamps: true }
);

placementApplicationSchema.index({ schoolId: 1, studentId: 1, jobId: 1 }, { unique: true });

const PlacementApplication = mongoose.model("PlacementApplication", placementApplicationSchema);
export default PlacementApplication;

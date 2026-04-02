import mongoose from "mongoose";

const placementJobSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    applyLink: { type: String, trim: true, default: "" },
    deadline: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PlacementJob = mongoose.model("PlacementJob", placementJobSchema);
export default PlacementJob;

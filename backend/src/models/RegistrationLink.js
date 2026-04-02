import mongoose from "mongoose";

const registrationLinkSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["EXAM_REGISTRATION", "COURSE_REGISTRATION", "EXTERNAL_LINK"], required: true },
    url: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const RegistrationLink = mongoose.model("RegistrationLink", registrationLinkSchema);
export default RegistrationLink;

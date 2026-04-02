import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    section: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], default: "OTHER" },
    dateOfBirth: { type: Date, default: null },
    address: { type: String, trim: true, default: "" },
    admissionDate: { type: Date, default: null },
    parentName: { type: String, trim: true, default: "" },
    parentPhone: { type: String, trim: true, default: "" },
    parentEmail: { type: String, trim: true, lowercase: true, default: "" },
    profileImage: { type: String, trim: true, default: "" },
    documents: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

studentSchema.index({ schoolId: 1, rollNumber: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);
export default Student;

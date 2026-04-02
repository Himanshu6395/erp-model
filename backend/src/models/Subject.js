import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    name: { type: String, required: true, trim: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
  },
  { timestamps: true }
);

subjectSchema.index({ schoolId: 1, classId: 1, name: 1 }, { unique: true });

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;

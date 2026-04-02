import mongoose from "mongoose";

const doubtQuerySchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const DoubtQuery = mongoose.model("DoubtQuery", doubtQuerySchema);
export default DoubtQuery;

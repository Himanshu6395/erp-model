import mongoose from "mongoose";

const reportCardSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    totalMarksObtained: { type: Number, default: 0, min: 0 },
    totalMaxMarks: { type: Number, default: 0, min: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    overallGrade: { type: String, trim: true, default: "" },
    rank: { type: Number, default: null },
    division: { type: String, trim: true, default: "" },
    finalResultStatus: { type: String, enum: ["PASS", "FAIL"], default: "PASS" },
    promotionStatus: { type: String, enum: ["PROMOTED", "NOT_PROMOTED"], default: "PROMOTED" },
    generatedDate: { type: Date, default: Date.now },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    pdfUrl: { type: String, trim: true, default: "" },
    signature: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

reportCardSchema.index({ examId: 1, studentId: 1 }, { unique: true });

const ReportCard = mongoose.model("ReportCard", reportCardSchema);
export default ReportCard;

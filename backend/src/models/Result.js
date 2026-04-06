import mongoose from "mongoose";

const marksComponentsSchema = new mongoose.Schema(
  {
    theory: { type: Number, default: null },
    practical: { type: Number, default: null },
    internal: { type: Number, default: null },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", default: null, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null, index: true },
    /** Stable key for uniqueness: String(subjectId) or legacy:legacy:<subjectName> */
    examSubjectKey: { type: String, required: true, trim: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
    subject: { type: String, trim: true, default: "" },
    marksComponents: { type: marksComponentsSchema, default: () => ({}) },
    /** Total marks obtained (sum of components after caps) */
    marks: { type: Number, required: true, min: 0 },
    marksObtained: { type: Number, min: 0, default: 0 },
    totalMarks: { type: Number, min: 0, default: 100 },
    maxMarks: { type: Number, min: 0, default: 100 },
    passingMarks: { type: Number, min: 0, default: 0 },
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    grade: { type: String, trim: true, default: "" },
    passFail: { type: String, enum: ["PASS", "FAIL"], default: "PASS" },
    resultStatusFlag: { type: String, enum: ["PASS", "FAIL"], default: "PASS" },
    rank: { type: Number, default: null },
    resultStatus: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" },
    remarks: { type: String, trim: true, default: "" },
    internalMarks: { type: Number, min: 0, default: 0 },
    practicalMarks: { type: Number, min: 0, default: 0 },
    vivaMarks: { type: Number, min: 0, default: 0 },
    graceMarks: { type: Number, min: 0, default: 0 },
    attendancePercentage: { type: Number, min: 0, max: 100, default: 0 },
    reEvaluationStatus: { type: String, enum: ["NOT_REQUESTED", "REQUESTED", "APPROVED", "REJECTED"], default: "NOT_REQUESTED" },
    supplementaryFlag: { type: Boolean, default: false },
    teacherRemarks: { type: String, trim: true, default: "" },
    principalRemarks: { type: String, trim: true, default: "" },
    strengths: { type: String, trim: true, default: "" },
    improvements: { type: String, trim: true, default: "" },
    totalMarksObtained: { type: Number, min: 0, default: 0 },
    totalMaxMarks: { type: Number, min: 0, default: 0 },
    overallGrade: { type: String, trim: true, default: "" },
    division: { type: String, trim: true, default: "" },
    finalResultStatus: { type: String, enum: ["PASS", "FAIL"], default: "PASS" },
    promotionStatus: { type: String, enum: ["PROMOTED", "NOT_PROMOTED"], default: "PROMOTED" },
  },
  { timestamps: true }
);

resultSchema.index({ schoolId: 1, studentId: 1, examId: 1, examSubjectKey: 1 }, { unique: true });
resultSchema.index({ schoolId: 1, examId: 1, subjectId: 1, resultStatus: 1 });

const Result = mongoose.model("Result", resultSchema);
export default Result;

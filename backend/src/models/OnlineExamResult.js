import mongoose from "mongoose";

const topicBreakdownSchema = new mongoose.Schema(
  {
    topic: { type: String, trim: true, default: "" },
    totalQuestions: { type: Number, min: 0, default: 0 },
    correctAnswers: { type: Number, min: 0, default: 0 },
    obtainedMarks: { type: Number, min: 0, default: 0 },
    totalMarks: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const onlineExamResultSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "OnlineExam", required: true, index: true },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "OnlineExamAttempt", required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    totalQuestions: { type: Number, min: 0, default: 0 },
    attemptedQuestions: { type: Number, min: 0, default: 0 },
    correctAnswers: { type: Number, min: 0, default: 0 },
    wrongAnswers: { type: Number, min: 0, default: 0 },
    descriptivePendingCount: { type: Number, min: 0, default: 0 },
    totalMarks: { type: Number, min: 0, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    negativeMarks: { type: Number, min: 0, default: 0 },
    percentage: { type: Number, min: 0, default: 0 },
    passed: { type: Boolean, default: false },
    rank: { type: Number, min: 1, default: null },
    evaluationStatus: { type: String, enum: ["AUTO_EVALUATED", "PENDING_MANUAL", "FINALIZED"], default: "AUTO_EVALUATED" },
    weakTopics: [{ type: String, trim: true }],
    topicBreakdown: { type: [topicBreakdownSchema], default: [] },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

onlineExamResultSchema.index({ schoolId: 1, examId: 1, studentId: 1 });

const OnlineExamResult = mongoose.model("OnlineExamResult", onlineExamResultSchema);
export default OnlineExamResult;

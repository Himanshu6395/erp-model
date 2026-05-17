import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "OnlineQuestion", required: true },
    questionType: { type: String, trim: true, default: "MCQ" },
    selectedOptions: [{ type: String, trim: true }],
    textAnswer: { type: String, trim: true, default: "" },
    isVisited: { type: Boolean, default: false },
    isMarkedForReview: { type: Boolean, default: false },
    savedAt: { type: Date, default: null },
    awardedMarks: { type: Number, min: 0, default: 0 },
    negativeMarksApplied: { type: Number, min: 0, default: 0 },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const activityLogSchema = new mongoose.Schema(
  {
    type: { type: String, trim: true, default: "INFO" },
    message: { type: String, trim: true, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const onlineExamAttemptSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "OnlineExam", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    attemptNumber: { type: Number, min: 1, default: 1 },
    status: { type: String, enum: ["IN_PROGRESS", "SUBMITTED", "AUTO_SUBMITTED"], default: "IN_PROGRESS", index: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "OnlineQuestion" }],
    answers: { type: [answerSchema], default: [] },
    tabSwitchCount: { type: Number, min: 0, default: 0 },
    fullScreenExitCount: { type: Number, min: 0, default: 0 },
    copyPasteViolations: { type: Number, min: 0, default: 0 },
    rightClickViolations: { type: Number, min: 0, default: 0 },
    violationCount: { type: Number, min: 0, default: 0 },
    activityLogs: { type: [activityLogSchema], default: [] },
  },
  { timestamps: true }
);

onlineExamAttemptSchema.index({ schoolId: 1, examId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });

const OnlineExamAttempt = mongoose.model("OnlineExamAttempt", onlineExamAttemptSchema);
export default OnlineExamAttempt;

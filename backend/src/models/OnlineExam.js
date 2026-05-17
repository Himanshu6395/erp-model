import mongoose from "mongoose";

const examApprovalSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    reviewedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    reason: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const examSecuritySchema = new mongoose.Schema(
  {
    negativeMarkingEnabled: { type: Boolean, default: false },
    negativeMarkPerQuestion: { type: Number, min: 0, default: 0 },
    randomQuestionsEnabled: { type: Boolean, default: false },
    shuffleOptionsEnabled: { type: Boolean, default: true },
    webcamMonitoringEnabled: { type: Boolean, default: false },
    autoSubmitEnabled: { type: Boolean, default: true },
    fullScreenRequired: { type: Boolean, default: true },
    copyPasteBlocked: { type: Boolean, default: true },
    rightClickDisabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const onlineExamSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null, index: true },
    title: { type: String, required: true, trim: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null, index: true },
    subjectName: { type: String, trim: true, default: "" },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    className: { type: String, trim: true, default: "" },
    section: { type: String, trim: true, default: "" },
    examType: { type: String, enum: ["MCQ", "DESCRIPTIVE", "MIXED", "TRUE_FALSE", "MULTIPLE_SELECT"], default: "MCQ" },
    totalMarks: { type: Number, min: 0, default: 0 },
    durationMinutes: { type: Number, min: 1, default: 60 },
    passingMarks: { type: Number, min: 0, default: 0 },
    instructions: { type: String, trim: true, default: "" },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "LIVE", "COMPLETED", "REJECTED", "LOCKED", "RESULT_PUBLISHED"],
      default: "DRAFT",
      index: true,
    },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "OnlineQuestion" }],
    randomQuestionCount: { type: Number, min: 0, default: 0 },
    security: { type: examSecuritySchema, default: () => ({}) },
    approval: { type: examApprovalSchema, default: () => ({}) },
    settings: {
      allowReviewAfterSubmit: { type: Boolean, default: true },
      resultVisibleToStudents: { type: Boolean, default: true },
      allowRetake: { type: Boolean, default: false },
      maxAttempts: { type: Number, min: 1, default: 1 },
      rankEnabled: { type: Boolean, default: true },
    },
    metadata: {
      importedQuestionCount: { type: Number, min: 0, default: 0 },
      aiGeneratedQuestionCount: { type: Number, min: 0, default: 0 },
      liveStudentCount: { type: Number, min: 0, default: 0 },
    },
  },
  { timestamps: true }
);

onlineExamSchema.index({ schoolId: 1, classId: 1, section: 1, startDateTime: -1 });
onlineExamSchema.index({ schoolId: 1, teacherId: 1, status: 1 });

const OnlineExam = mongoose.model("OnlineExam", onlineExamSchema);
export default OnlineExam;

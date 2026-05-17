import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, default: "" },
    text: { type: String, trim: true, default: "" },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const onlineQuestionSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null, index: true },
    subjectName: { type: String, trim: true, default: "" },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null, index: true },
    className: { type: String, trim: true, default: "" },
    section: { type: String, trim: true, default: "" },
    topic: { type: String, trim: true, default: "", index: true },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], default: "MEDIUM", index: true },
    bloomLevel: { type: String, trim: true, default: "Understand" },
    questionType: { type: String, enum: ["MCQ", "MULTIPLE_SELECT", "TRUE_FALSE", "FILL_BLANKS", "DESCRIPTIVE", "MATCH_FOLLOWING"], default: "MCQ", index: true },
    questionText: { type: String, required: true, trim: true },
    options: { type: [optionSchema], default: [] },
    correctAnswers: [{ type: String, trim: true }],
    explanation: { type: String, trim: true, default: "" },
    marks: { type: Number, min: 0, default: 1 },
    negativeMarks: { type: Number, min: 0, default: 0 },
    reusable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    sourceType: { type: String, enum: ["MANUAL", "IMPORT", "AI"], default: "MANUAL" },
  },
  { timestamps: true }
);

onlineQuestionSchema.index({ schoolId: 1, subjectId: 1, topic: 1 });
onlineQuestionSchema.index({ schoolId: 1, questionType: 1, difficulty: 1 });

const OnlineQuestion = mongoose.model("OnlineQuestion", onlineQuestionSchema);
export default OnlineQuestion;

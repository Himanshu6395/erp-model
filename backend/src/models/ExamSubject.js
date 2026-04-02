import mongoose from "mongoose";

const componentMaxSchema = new mongoose.Schema(
  {
    theory: { type: Number, default: 0, min: 0 },
    practical: { type: Number, default: 0, min: 0 },
    internal: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const examSubjectSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    subjectName: { type: String, trim: true, default: "" },
    subjectCode: { type: String, trim: true, default: "" },
    maxMarks: { type: Number, required: true, min: 1 },
    passingMarks: { type: Number, required: true, min: 0 },
    components: { type: componentMaxSchema, default: () => ({ theory: 0, practical: 0, internal: 0 }) },
    /** Optional weight % for each component (should sum ~100 when used for weighted average) */
    weightage: {
      theory: { type: Number, default: 0, min: 0, max: 100 },
      practical: { type: Number, default: 0, min: 0, max: 100 },
      internal: { type: Number, default: 0, min: 0, max: 100 },
    },
  },
  { timestamps: true }
);

examSubjectSchema.index({ examId: 1, subjectId: 1 }, { unique: true });

const ExamSubject = mongoose.model("ExamSubject", examSubjectSchema);
export default ExamSubject;

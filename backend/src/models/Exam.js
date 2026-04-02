import mongoose from "mongoose";

const gradingBandSchema = new mongoose.Schema(
  {
    grade: { type: String, required: true, trim: true },
    minPct: { type: Number, required: true },
    maxPct: { type: Number, required: true },
  },
  { _id: false }
);

const examSettingsSchema = new mongoose.Schema(
  {
    graceMarksEnabled: { type: Boolean, default: false },
    graceMarksLimit: { type: Number, default: 0, min: 0 },
    roundingMode: { type: String, enum: ["NEAREST", "FLOOR", "CEIL"], default: "NEAREST" },
    rankEnabled: { type: Boolean, default: true },
    attendanceMinPct: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const examSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true },
    /** @deprecated use name — kept for older clients */
    title: { type: String, trim: true, default: "" },
    academicYear: { type: String, trim: true, default: "2025-2026" },
    term: { type: String, trim: true, default: "Term 1" },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    section: { type: String, trim: true, default: "" },
    examType: { type: String, enum: ["THEORY", "PRACTICAL", "COMBINED"], default: "COMBINED" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    resultPublishDate: { type: Date, default: null },
    /** @deprecated use startDate */
    examDate: { type: Date, default: null },
    status: { type: String, enum: ["DRAFT", "ONGOING", "COMPLETED", "PUBLISHED"], default: "DRAFT" },
    gradingScale: { type: [gradingBandSchema], default: [] },
    settings: { type: examSettingsSchema, default: () => ({}) },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
  },
  { timestamps: true }
);

examSchema.index({ schoolId: 1, classId: 1, academicYear: 1, status: 1 });

examSchema.pre("save", function syncLegacy(next) {
  if (!this.name && this.title) this.name = this.title;
  if (!this.title && this.name) this.title = this.name;
  if (!this.startDate && this.examDate) this.startDate = this.examDate;
  if (!this.endDate && this.examDate) this.endDate = this.examDate;
  if (!this.examDate && this.startDate) this.examDate = this.startDate;
  if (!this.gradingScale?.length) {
    this.gradingScale = [
      { grade: "A+", minPct: 90, maxPct: 100 },
      { grade: "A", minPct: 75, maxPct: 89.99 },
      { grade: "B", minPct: 60, maxPct: 74.99 },
      { grade: "C", minPct: 40, maxPct: 59.99 },
      { grade: "F", minPct: 0, maxPct: 39.99 },
    ];
  }
  next();
});

const Exam = mongoose.model("Exam", examSchema);
export default Exam;

import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    academicYear: { type: String, trim: true, default: "2025-2026", index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    section: { type: String, trim: true, default: "" },
    day: { type: String, required: true, trim: true },
    periodNumber: { type: Number, required: true, min: 1 },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
    /** Display label when break or legacy row without subjectId */
    subjectLabel: { type: String, trim: true, default: "" },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
    roomNumber: { type: String, trim: true, default: "" },
    isBreak: { type: Boolean, default: false },
    notes: { type: String, trim: true, default: "" },
    /** @deprecated — use subjectLabel + subjectId */
    subject: { type: String, trim: true, default: "" },
    /** @deprecated — migrated to periodNumber */
    period: { type: Number, min: 1 },
  },
  { timestamps: true }
);

timetableSchema.pre("save", function syncPeriod(next) {
  if (this.periodNumber == null && this.period != null) this.periodNumber = this.period;
  next();
});

timetableSchema.index({ schoolId: 1, academicYear: 1, classId: 1, section: 1, day: 1, periodNumber: 1 }, { unique: true });
timetableSchema.index({ schoolId: 1, academicYear: 1, teacherId: 1, day: 1 });

timetableSchema.pre("save", function syncLegacy(next) {
  if (!this.subjectLabel && this.subject) this.subjectLabel = this.subject;
  next();
});

const Timetable = mongoose.model("Timetable", timetableSchema);
export default Timetable;

import mongoose from "mongoose";

const examScheduleSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    subjectName: { type: String, trim: true, default: "" },
    subjectCode: { type: String, trim: true, default: "" },
    examDate: { type: Date, required: true },
    startTime: { type: String, trim: true, required: true },
    endTime: { type: String, trim: true, required: true },
    duration: { type: Number, min: 0, default: 0 },
    roomNumber: { type: String, trim: true, default: "" },
    invigilatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
    invigilatorName: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

examScheduleSchema.index({ examId: 1, subjectId: 1 }, { unique: true });

const ExamSchedule = mongoose.model("ExamSchedule", examScheduleSchema);
export default ExamSchedule;

import mongoose from "mongoose";

const LEAVE_TYPES = ["SICK", "CASUAL", "EMERGENCY", "OTHER"];
const LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

const studentLeaveSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    leaveType: { type: String, enum: LEAVE_TYPES, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, required: true, min: 1 },
    reason: { type: String, trim: true, default: "" },
    attachmentUrl: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    parentName: { type: String, trim: true, default: "" },
    status: { type: String, enum: LEAVE_STATUSES, default: "PENDING" },
    teacherRemarks: { type: String, trim: true, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

studentLeaveSchema.index({ schoolId: 1, studentId: 1, createdAt: -1 });
studentLeaveSchema.index({ schoolId: 1, classTeacherId: 1, status: 1 });

const StudentLeave = mongoose.model("StudentLeave", studentLeaveSchema);
export default StudentLeave;
export { LEAVE_TYPES, LEAVE_STATUSES };

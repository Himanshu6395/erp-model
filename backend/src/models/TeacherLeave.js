import mongoose from "mongoose";

export const TEACHER_LEAVE_TYPES = ["SICK", "CASUAL", "EMERGENCY", "HALF_DAY", "OTHER"];
export const TEACHER_LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const teacherLeaveSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    leaveType: { type: String, enum: TEACHER_LEAVE_TYPES, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    /** @deprecated use fromDate — kept for legacy documents */
    startDate: { type: Date },
    /** @deprecated use toDate */
    endDate: { type: Date },
    totalDays: { type: Number, required: true, min: 1 },
    reason: { type: String, trim: true, default: "" },
    attachmentUrl: { type: String, trim: true, default: "" },
    emergencyContact: { type: String, trim: true, default: "" },
    status: { type: String, enum: TEACHER_LEAVE_STATUSES, default: "PENDING" },
    adminRemarks: { type: String, trim: true, default: "" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

teacherLeaveSchema.index({ schoolId: 1, teacherId: 1, createdAt: -1 });
teacherLeaveSchema.index({ schoolId: 1, status: 1, fromDate: -1 });

const TeacherLeave = mongoose.model("TeacherLeave", teacherLeaveSchema);
export default TeacherLeave;

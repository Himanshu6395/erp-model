import mongoose from "mongoose";

const teacherActivityLogSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    action: { type: String, required: true, trim: true },
    ipAddress: { type: String, trim: true, default: "" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

const TeacherActivityLog = mongoose.model("TeacherActivityLog", teacherActivityLogSchema);
export default TeacherActivityLog;

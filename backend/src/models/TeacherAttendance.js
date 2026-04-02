import mongoose from "mongoose";

const teacherAttendanceSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["PRESENT", "ABSENT"], required: true },
  },
  { timestamps: true }
);

teacherAttendanceSchema.index({ schoolId: 1, teacherId: 1, date: 1 }, { unique: true });

const TeacherAttendance = mongoose.model("TeacherAttendance", teacherAttendanceSchema);
export default TeacherAttendance;

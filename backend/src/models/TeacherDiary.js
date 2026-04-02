import mongoose from "mongoose";

const teacherDiarySchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    subject: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    notes: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const TeacherDiary = mongoose.model("TeacherDiary", teacherDiarySchema);
export default TeacherDiary;

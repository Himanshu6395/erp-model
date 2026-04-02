import mongoose from "mongoose";

const studentFeedbackSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

const StudentFeedback = mongoose.model("StudentFeedback", studentFeedbackSchema);
export default StudentFeedback;

import mongoose from "mongoose";

const studentComplaintSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"], default: "OPEN" },
  },
  { timestamps: true }
);

const StudentComplaint = mongoose.model("StudentComplaint", studentComplaintSchema);
export default StudentComplaint;

import mongoose from "mongoose";

const homeworkSubmissionSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    submissionText: { type: String, trim: true, default: "" },
    attachments: [{ type: String, trim: true }],
    submittedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

homeworkSubmissionSchema.index({ schoolId: 1, assignmentId: 1, studentId: 1 }, { unique: true });

const HomeworkSubmission = mongoose.model("HomeworkSubmission", homeworkSubmissionSchema);
export default HomeworkSubmission;

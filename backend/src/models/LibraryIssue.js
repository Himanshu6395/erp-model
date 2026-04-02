import mongoose from "mongoose";

const libraryIssueSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "LibraryBook", required: true, index: true },
    issueDate: { type: Date, required: true, default: Date.now },
    returnDate: { type: Date, default: null },
    fine: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

const LibraryIssue = mongoose.model("LibraryIssue", libraryIssueSchema);
export default LibraryIssue;

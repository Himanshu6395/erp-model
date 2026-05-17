import mongoose from "mongoose";

const libraryIssueSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "LibraryBook", required: true, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "LibraryCategory", default: null },
    requestedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    returnedToUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["REQUESTED", "ISSUED", "RETURNED", "OVERDUE", "REJECTED", "CANCELLED"],
      default: "ISSUED",
      index: true,
    },
    fine: { type: Number, min: 0, default: 0 },
    fineStatus: { type: String, enum: ["NONE", "PENDING", "PAID", "WAIVED"], default: "NONE" },
    requestNote: { type: String, trim: true, default: "" },
    rejectionReason: { type: String, trim: true, default: "" },
    returnNote: { type: String, trim: true, default: "" },
    studentSnapshot: {
      name: { type: String, trim: true, default: "" },
      rollNumber: { type: String, trim: true, default: "" },
      section: { type: String, trim: true, default: "" },
      profileImage: { type: String, trim: true, default: "" },
      className: { type: String, trim: true, default: "" },
    },
    bookSnapshot: {
      title: { type: String, trim: true, default: "" },
      bookCode: { type: String, trim: true, default: "" },
      author: { type: String, trim: true, default: "" },
      isbn: { type: String, trim: true, default: "" },
      categoryName: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

libraryIssueSchema.index({ schoolId: 1, status: 1, dueDate: 1 });
libraryIssueSchema.index({ schoolId: 1, studentId: 1, bookId: 1, status: 1 });

const LibraryIssue = mongoose.model("LibraryIssue", libraryIssueSchema);
export default LibraryIssue;

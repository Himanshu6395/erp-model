import mongoose from "mongoose";

const libraryFineRecordSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "LibraryIssue", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "LibraryBook", required: true, index: true },
    amount: { type: Number, min: 0, required: true },
    daysOverdue: { type: Number, min: 0, default: 0 },
    reason: { type: String, trim: true, default: "Overdue return" },
    status: { type: String, enum: ["PENDING", "PAID", "WAIVED"], default: "PENDING", index: true },
    paidAt: { type: Date, default: null },
    paidByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    waivedAt: { type: Date, default: null },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

libraryFineRecordSchema.index({ schoolId: 1, status: 1, createdAt: -1 });
libraryFineRecordSchema.index({ schoolId: 1, issueId: 1 }, { unique: true });

const LibraryFineRecord = mongoose.model("LibraryFineRecord", libraryFineRecordSchema);
export default LibraryFineRecord;

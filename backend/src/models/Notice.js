import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true, trim: true },
    /** Primary long-form body (legacy field `message` kept in sync when possible) */
    description: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" },
    noticeType: {
      type: String,
      enum: ["GENERAL", "URGENT", "EVENT", "HOLIDAY"],
      default: "GENERAL",
    },
    targetAudience: {
      type: String,
      enum: ["STUDENTS", "TEACHERS", "BOTH"],
      default: "BOTH",
    },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null, index: true },
    section: { type: String, trim: true, default: "" },
    attachmentUrl: { type: String, trim: true, default: "" },
    attachmentOriginalName: { type: String, trim: true, default: "" },
    publishDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "PUBLISHED",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

noticeSchema.pre("save", function syncBody(next) {
  if (!this.description && this.message) this.description = this.message;
  if (!this.message && this.description) this.message = this.description;
  if (this.isNew && !this.publishDate) this.publishDate = new Date();
  next();
});

const Notice = mongoose.model("Notice", noticeSchema);
export default Notice;

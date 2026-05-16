import mongoose from "mongoose";

export const INQUIRY_STATUS = ["PENDING", "FOLLOW_UP", "DROPPED", "CONVERTED_TO_ADMISSION"];

export const INQUIRY_SOURCE = ["WALK_IN", "WEBSITE", "FACEBOOK", "INSTAGRAM", "REFERENCE", "TEACHER", "OTHER"];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: INQUIRY_STATUS, required: true },
    note: { type: String, trim: true, default: "" },
    changedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const followUpSchema = new mongoose.Schema(
  {
    followUpDate: { type: Date, required: true },
    remarks: { type: String, trim: true, default: "" },
    nextAction: { type: String, trim: true, default: "" },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, required: true },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    assignedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversionSchema = new mongoose.Schema(
  {
    convertedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    convertedAt: { type: Date, default: Date.now },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    admissionNumber: { type: String, trim: true, default: "" },
    rollNumber: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const inquirySchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    /** Human-readable id e.g. INQ-SCH-0001 */
    inquiryId: { type: String, trim: true, index: true },
    studentFullName: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true, default: "" },
    motherName: { type: String, trim: true, default: "" },
    mobileNumber: { type: String, required: true, trim: true },
    alternateNumber: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], default: "OTHER" },
    dateOfBirth: { type: Date, default: null },
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    interestedClass: { type: String, trim: true, default: "" },
    interestedClassId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
    previousSchool: { type: String, trim: true, default: "" },
    source: { type: String, enum: INQUIRY_SOURCE, default: "WALK_IN" },
    counselorNotes: { type: String, trim: true, default: "" },
    followUpDate: { type: Date, default: null },
    assignedTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
    assignment: { type: assignmentSchema, default: null },
    status: { type: String, enum: INQUIRY_STATUS, default: "PENDING", index: true },
    statusHistory: { type: [statusHistorySchema], default: [] },
    followUps: { type: [followUpSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
    conversion: { type: conversionSchema, default: null },
  },
  { timestamps: true }
);

inquirySchema.index({ schoolId: 1, inquiryId: 1 }, { unique: true, partialFilterExpression: { inquiryId: { $type: "string", $gt: "" } } });
inquirySchema.index({ schoolId: 1, createdAt: -1 });
inquirySchema.index({ schoolId: 1, assignedTeacherId: 1 });

const Inquiry = mongoose.model("Inquiry", inquirySchema);
export default Inquiry;

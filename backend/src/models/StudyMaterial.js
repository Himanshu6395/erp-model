import mongoose from "mongoose";

export const MATERIAL_TYPES = [
  "NOTES",
  "ASSIGNMENT",
  "HOMEWORK",
  "SYLLABUS",
  "QUESTION_PAPER",
  "REFERENCE",
];

const studyMaterialSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    section: { type: String, required: true, trim: true, default: "A" },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null, index: true },
    /** Legacy / fallback label when subjectId is missing */
    subject: { type: String, trim: true, default: "" },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    topic: { type: String, trim: true, default: "" },
    materialType: { type: String, enum: MATERIAL_TYPES, default: "NOTES" },
    fileUrl: { type: String, trim: true, default: "" },
    externalLink: { type: String, trim: true, default: "" },
    thumbnail: { type: String, trim: true, default: "" },
    publishDate: { type: Date, default: () => new Date() },
    expiryDate: { type: Date, default: null },
    visibility: { type: String, enum: ["PUBLIC", "RESTRICTED"], default: "PUBLIC" },
    restrictedStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    allowDownload: { type: Boolean, default: true },
    allowComments: { type: Boolean, default: false },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" },
    downloadCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

studyMaterialSchema.index({ schoolId: 1, teacherId: 1, createdAt: -1 });
studyMaterialSchema.index({ schoolId: 1, classId: 1, section: 1, status: 1, publishDate: -1 });

const StudyMaterial = mongoose.model("StudyMaterial", studyMaterialSchema);
export default StudyMaterial;

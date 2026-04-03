import mongoose from "mongoose";

const documentItemSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    section: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    /** Auto-generated display ID (e.g. SCHCODE-00001) */
    studentCode: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    alternatePhone: { type: String, trim: true, default: "" },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], default: "OTHER" },
    dateOfBirth: { type: Date, default: null },
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    admissionDate: { type: Date, default: null },
    admissionNumber: { type: String, trim: true, default: "" },
    parentName: { type: String, trim: true, default: "" },
    fatherName: { type: String, trim: true, default: "" },
    motherName: { type: String, trim: true, default: "" },
    guardianName: { type: String, trim: true, default: "" },
    parentPhone: { type: String, trim: true, default: "" },
    parentEmail: { type: String, trim: true, lowercase: true, default: "" },
    profileImage: { type: String, trim: true, default: "" },
    documents: { type: [documentItemSchema], default: [] },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "PASSED", "TRANSFERRED"],
      default: "ACTIVE",
    },
    transportRequired: { type: Boolean, default: false },
    transportRouteId: { type: String, trim: true, default: "" },
    pickupPoint: { type: String, trim: true, default: "" },
    hostelRequired: { type: Boolean, default: false },
    hostelRoomNumber: { type: String, trim: true, default: "" },
    bloodGroup: { type: String, trim: true, default: "" },
    allergies: { type: String, trim: true, default: "" },
    medicalNotes: { type: String, trim: true, default: "" },
    previousSchool: { type: String, trim: true, default: "" },
    religion: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    nationality: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

function normalizeDocumentsArray(docs) {
  if (!Array.isArray(docs)) return [];
  return docs
    .map((item) => {
      if (typeof item === "string") {
        const u = item.trim();
        return u ? { name: "Document", url: u } : null;
      }
      if (item && typeof item === "object") {
        const url = String(item.url || item.documentUrl || "").trim();
        const name = String(item.name || item.documentName || "").trim();
        return url ? { name: name || "Document", url } : null;
      }
      return null;
    })
    .filter(Boolean);
}

studentSchema.pre("save", function normalizeDocuments(next) {
  if (Array.isArray(this.documents)) {
    this.documents = normalizeDocumentsArray(this.documents);
  }
  next();
});

studentSchema.index({ schoolId: 1, rollNumber: 1 }, { unique: true });
studentSchema.index(
  { schoolId: 1, studentCode: 1 },
  {
    unique: true,
    partialFilterExpression: { studentCode: { $type: "string", $gt: "" } },
  }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;

import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], default: "OTHER" },
    dateOfBirth: { type: Date, default: null },
    qualification: { type: String, trim: true, default: "" },
    department: { type: String, trim: true, default: "" },
    employeeId: { type: String, trim: true, default: "" },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    subjectNames: [{ type: String, trim: true }],
    experience: { type: Number, min: 0, default: 0 },
    salary: { type: Number, min: 0, default: 0 },
    joiningDate: { type: Date, default: null },
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    sections: [{ type: String, trim: true }],
    timetableId: { type: mongoose.Schema.Types.ObjectId, ref: "Timetable", default: null },
    addressLine: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    profileImage: { type: String, trim: true, default: "" },
    bankName: { type: String, trim: true, default: "" },
    accountNumber: { type: String, trim: true, default: "" },
    ifscCode: { type: String, trim: true, default: "" },
    panCard: { type: String, trim: true, default: "" },
    aadharNumber: { type: String, trim: true, default: "" },
    documents: {
      resume: { type: String, trim: true, default: "" },
      certificates: [{ type: String, trim: true }],
      idProof: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

teacherSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true, sparse: true });

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;

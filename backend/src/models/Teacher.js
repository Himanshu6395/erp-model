import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phone: { type: String, trim: true, default: "" },
    subject: { type: String, trim: true, default: "" },
    qualification: { type: String, trim: true, default: "" },
    experience: { type: Number, min: 0, default: 0 },
    salary: { type: Number, min: 0, default: 0 },
    joiningDate: { type: Date, default: null },
    address: { type: String, trim: true, default: "" },
    profileImage: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;

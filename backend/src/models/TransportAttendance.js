import mongoose from "mongoose";

const transportAttendanceSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    date: { type: Date, required: true, index: true },
    pickupStatus: { type: String, enum: ["PICKED", "MISSED"], required: true },
    dropStatus: { type: String, enum: ["DROPPED", "MISSED"], required: true },
    remarks: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

transportAttendanceSchema.index({ schoolId: 1, studentId: 1, date: 1 }, { unique: true });

const TransportAttendance = mongoose.model("TransportAttendance", transportAttendanceSchema);
export default TransportAttendance;

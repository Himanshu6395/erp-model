import mongoose from "mongoose";

const studentTransportAssignmentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportRoute", required: true, index: true },
    stopId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportStop", required: true, index: true },
    pickupPoint: { type: String, trim: true, default: "" },
    dropPoint: { type: String, trim: true, default: "" },
    assignedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

studentTransportAssignmentSchema.index({ schoolId: 1, studentId: 1 }, { unique: true });

const StudentTransportAssignment = mongoose.model("StudentTransportAssignment", studentTransportAssignmentSchema);
export default StudentTransportAssignment;

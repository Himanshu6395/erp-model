import mongoose from "mongoose";

const transportRouteAssignmentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportRoute", required: true, index: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportVehicle", required: true, index: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportDriver", required: true, index: true },
    conductorId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportConductor", default: null, index: true },
    shift: { type: String, enum: ["MORNING", "AFTERNOON"], required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

const TransportRouteAssignment = mongoose.model("TransportRouteAssignment", transportRouteAssignmentSchema);
export default TransportRouteAssignment;

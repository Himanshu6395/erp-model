import mongoose from "mongoose";

const vehicleTrackingSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportVehicle", required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speed: { type: Number, min: 0, default: 0 },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true }
);

const VehicleTracking = mongoose.model("VehicleTracking", vehicleTrackingSchema);
export default VehicleTracking;

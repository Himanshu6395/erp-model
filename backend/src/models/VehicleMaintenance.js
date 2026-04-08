import mongoose from "mongoose";

const vehicleMaintenanceSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportVehicle", required: true, index: true },
    serviceType: { type: String, required: true, trim: true },
    serviceDate: { type: Date, required: true },
    cost: { type: Number, min: 0, default: 0 },
    description: { type: String, trim: true, default: "" },
    nextServiceDate: { type: Date, default: null },
    status: { type: String, enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED"], default: "SCHEDULED" },
  },
  { timestamps: true }
);

const VehicleMaintenance = mongoose.model("VehicleMaintenance", vehicleMaintenanceSchema);
export default VehicleMaintenance;

import mongoose from "mongoose";

const transportConductorSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true, default: "" },
    assignedVehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportVehicle", default: null },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

const TransportConductor = mongoose.model("TransportConductor", transportConductorSchema);
export default TransportConductor;

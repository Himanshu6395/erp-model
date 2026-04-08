import mongoose from "mongoose";

const transportVehicleSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    vehicleNumber: { type: String, required: true, trim: true },
    vehicleType: { type: String, enum: ["BUS", "VAN"], required: true },
    capacity: { type: Number, required: true, min: 1 },
    model: { type: String, trim: true, default: "" },
    manufacturer: { type: String, trim: true, default: "" },
    registrationNumber: { type: String, trim: true, default: "" },
    insuranceNumber: { type: String, trim: true, default: "" },
    insuranceExpiryDate: { type: Date, default: null },
    fitnessCertificateNumber: { type: String, trim: true, default: "" },
    fitnessExpiryDate: { type: Date, default: null },
    pollutionCertificateNumber: { type: String, trim: true, default: "" },
    pollutionExpiryDate: { type: Date, default: null },
    gpsEnabled: { type: Boolean, default: false },
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "MAINTENANCE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

transportVehicleSchema.index({ schoolId: 1, vehicleNumber: 1 }, { unique: true });

const TransportVehicle = mongoose.model("TransportVehicle", transportVehicleSchema);
export default TransportVehicle;

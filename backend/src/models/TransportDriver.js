import mongoose from "mongoose";

const transportDriverSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    driverName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    alternatePhone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    address: { type: String, trim: true, default: "" },
    licenseNumber: { type: String, required: true, trim: true },
    licenseExpiryDate: { type: Date, default: null },
    experienceYears: { type: Number, min: 0, default: 0 },
    joiningDate: { type: Date, default: null },
    salary: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

transportDriverSchema.index({ schoolId: 1, licenseNumber: 1 }, { unique: true });

const TransportDriver = mongoose.model("TransportDriver", transportDriverSchema);
export default TransportDriver;

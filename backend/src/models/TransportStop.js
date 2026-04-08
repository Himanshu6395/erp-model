import mongoose from "mongoose";

const transportStopSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportRoute", required: true, index: true },
    stopName: { type: String, required: true, trim: true },
    stopAddress: { type: String, trim: true, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    stopOrder: { type: Number, required: true, min: 1 },
    pickupTime: { type: String, trim: true, default: "" },
    dropTime: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

transportStopSchema.index({ routeId: 1, stopOrder: 1 }, { unique: true });

const TransportStop = mongoose.model("TransportStop", transportStopSchema);
export default TransportStop;

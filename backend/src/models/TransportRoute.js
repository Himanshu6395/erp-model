import mongoose from "mongoose";

const transportRouteSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    routeName: { type: String, required: true, trim: true },
    routeCode: { type: String, required: true, trim: true },
    startLocation: { type: String, required: true, trim: true },
    endLocation: { type: String, required: true, trim: true },
    totalDistance: { type: Number, min: 0, default: 0 },
    estimatedTime: { type: Number, min: 0, default: 0 },
    description: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

transportRouteSchema.index({ schoolId: 1, routeCode: 1 }, { unique: true });

const TransportRoute = mongoose.model("TransportRoute", transportRouteSchema);
export default TransportRoute;

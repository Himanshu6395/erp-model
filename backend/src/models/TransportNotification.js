import mongoose from "mongoose";

const transportNotificationSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ["DELAY", "EMERGENCY", "GENERAL"], required: true },
    sentTo: { type: String, enum: ["STUDENTS", "PARENTS", "ALL"], required: true },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const TransportNotification = mongoose.model("TransportNotification", transportNotificationSchema);
export default TransportNotification;

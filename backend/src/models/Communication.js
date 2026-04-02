import mongoose from "mongoose";

const communicationSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    receiverType: { type: String, enum: ["student", "parent", "class"], required: true },
    receiverIds: [{ type: String, trim: true }],
    channels: [{ type: String, enum: ["EMAIL", "SMS", "WHATSAPP"] }],
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Communication = mongoose.model("Communication", communicationSchema);
export default Communication;

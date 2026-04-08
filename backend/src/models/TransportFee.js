import mongoose from "mongoose";

const transportFeeSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportRoute", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentFrequency: { type: String, enum: ["MONTHLY", "QUARTERLY", "YEARLY"], required: true },
    dueDate: { type: Date, required: true },
    paymentStatus: { type: String, enum: ["PAID", "UNPAID", "PARTIAL"], default: "UNPAID" },
    paymentDate: { type: Date, default: null },
    paymentMode: { type: String, enum: ["CASH", "ONLINE"], default: "CASH" },
    receiptNumber: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const TransportFee = mongoose.model("TransportFee", transportFeeSchema);
export default TransportFee;

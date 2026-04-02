import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ["RAZORPAY", "STRIPE", "CASH"], required: true },
    status: { type: String, enum: ["PAID", "FAILED", "PENDING", "REFUNDED"], default: "PAID", index: true },
    transactionId: { type: String, trim: true, default: "" },
    paidAt: { type: Date, default: Date.now },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;

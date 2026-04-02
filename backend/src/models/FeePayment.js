import mongoose from "mongoose";

const feePaymentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    studentFeeId: { type: mongoose.Schema.Types.ObjectId, ref: "FeeAssignment", default: null, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMode: {
      type: String,
      enum: ["CASH", "UPI", "CARD", "NET_BANKING", "OTHER"],
      default: "CASH",
    },
    /** legacy alias */
    paymentMethod: { type: String, trim: true, default: "" },
    transactionId: { type: String, trim: true, default: "" },
    collectedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    receiptNumber: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

feePaymentSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true, sparse: true });

const FeePayment = mongoose.model("FeePayment", feePaymentSchema);
export default FeePayment;

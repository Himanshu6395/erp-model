import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    label: { type: String, trim: true, default: "" },
    amount: { type: Number, min: 0, default: 0 },
    dueDate: { type: Date, default: null },
    paidAmount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["PENDING", "PARTIAL", "PAID"], default: "PENDING" },
  },
  { _id: false }
);

const feeAssignmentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: "FeeStructure", required: true, index: true },
    academicYear: { type: String, trim: true, default: "" },
    feesBreakdownSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
    totalAmount: { type: Number, min: 0, default: 0 },
    structureDiscountAmount: { type: Number, min: 0, default: 0 },
    manualDiscountAmount: { type: Number, min: 0, default: 0 },
    finalAmount: { type: Number, min: 0, default: 0 },
    paidAmount: { type: Number, min: 0, default: 0 },
    remainingAmount: { type: Number, min: 0, default: 0 },
    fineAmount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["UNPAID", "PARTIAL", "PAID", "OVERDUE"], default: "UNPAID" },
    dueDate: { type: Date, default: null },
    installmentDetails: { type: [installmentSchema], default: [] },
    /** @deprecated use finalAmount */
    amount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

feeAssignmentSchema.index({ schoolId: 1, studentId: 1, feeStructureId: 1 });

const FeeAssignment = mongoose.model("FeeAssignment", feeAssignmentSchema);
export default FeeAssignment;

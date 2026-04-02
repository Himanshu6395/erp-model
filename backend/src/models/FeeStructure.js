import mongoose from "mongoose";

const otherChargeSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Charge" },
    amount: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const feesBreakdownSchema = new mongoose.Schema(
  {
    tuitionFee: { type: Number, min: 0, default: 0 },
    admissionFee: { type: Number, min: 0, default: 0 },
    transportFee: { type: Number, min: 0, default: 0 },
    hostelFee: { type: Number, min: 0, default: 0 },
    examFee: { type: Number, min: 0, default: 0 },
    libraryFee: { type: Number, min: 0, default: 0 },
    sportsFee: { type: Number, min: 0, default: 0 },
    otherCharges: { type: [otherChargeSchema], default: [] },
  },
  { _id: false }
);

const feeStructureSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    section: { type: String, trim: true, default: "" },
    feesBreakdown: { type: feesBreakdownSchema, default: () => ({}) },
    discountType: { type: String, enum: ["NONE", "FIXED", "PERCENTAGE"], default: "NONE" },
    discountValue: { type: Number, min: 0, default: 0 },
    totalAmount: { type: Number, min: 0, default: 0 },
    frequency: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"],
      default: "YEARLY",
    },
    installmentEnabled: { type: Boolean, default: false },
    numberOfInstallments: { type: Number, min: 1, max: 24, default: 1 },
    dueDate: { type: Date, default: null },
    fineType: { type: String, enum: ["NONE", "FIXED", "PER_DAY"], default: "NONE" },
    fineAmount: { type: Number, min: 0, default: 0 },
    gracePeriodDays: { type: Number, min: 0, default: 0 },
    applicableFrom: { type: Date, default: null },
    applicableTo: { type: Date, default: null },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    /** @deprecated legacy single amount */
    amount: { type: Number, min: 0, default: 0 },
    category: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

feeStructureSchema.index(
  { schoolId: 1, classId: 1, academicYear: 1, section: 1 },
  { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);

const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);
export default FeeStructure;

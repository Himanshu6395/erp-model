import mongoose from "mongoose";

const feesSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    total: { type: Number, required: true, min: 0 },
    paid: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Fees = mongoose.model("Fees", feesSchema);
export default Fees;

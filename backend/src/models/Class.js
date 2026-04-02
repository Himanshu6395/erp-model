import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
  },
  { timestamps: true }
);

classSchema.index({ schoolId: 1, name: 1, section: 1 }, { unique: true });

const ClassModel = mongoose.model("Class", classSchema);
export default ClassModel;

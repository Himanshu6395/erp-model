import mongoose from "mongoose";

const libraryCategorySchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    color: { type: String, trim: true, default: "#2563eb" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

libraryCategorySchema.index({ schoolId: 1, name: 1 }, { unique: true });

const LibraryCategory = mongoose.model("LibraryCategory", libraryCategorySchema);
export default LibraryCategory;

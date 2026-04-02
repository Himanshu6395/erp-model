import mongoose from "mongoose";

const libraryBookSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: "" },
    isbn: { type: String, trim: true, default: "" },
    copies: { type: Number, min: 0, default: 1 },
  },
  { timestamps: true }
);

const LibraryBook = mongoose.model("LibraryBook", libraryBookSchema);
export default LibraryBook;

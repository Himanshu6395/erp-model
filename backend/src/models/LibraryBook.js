import mongoose from "mongoose";

const libraryBookSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    bookCode: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: "" },
    isbn: { type: String, trim: true, default: "" },
    publisher: { type: String, trim: true, default: "" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "LibraryCategory", default: null, index: true },
    language: { type: String, trim: true, default: "English" },
    quantity: { type: Number, min: 0, default: 1 },
    availableCopies: { type: Number, min: 0, default: 1 },
    shelfNumber: { type: String, trim: true, default: "" },
    rackNumber: { type: String, trim: true, default: "" },
    bookImage: { type: String, trim: true, default: "" },
    ebookUrl: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    barcode: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["AVAILABLE", "LOW_STOCK", "OUT_OF_STOCK", "ARCHIVED"], default: "AVAILABLE" },
  },
  { timestamps: true }
);

libraryBookSchema.pre("validate", function normalizeLibraryBook(next) {
  const quantity = Number(this.quantity ?? this.copies ?? 1);
  const availableCopies = Number(this.availableCopies ?? quantity);

  this.quantity = Number.isFinite(quantity) && quantity >= 0 ? quantity : 0;
  this.availableCopies = Number.isFinite(availableCopies) ? Math.max(0, Math.min(availableCopies, this.quantity)) : this.quantity;

  if (this.status !== "ARCHIVED") {
    if (this.availableCopies <= 0) this.status = "OUT_OF_STOCK";
    else if (this.availableCopies <= Math.max(1, Math.floor(this.quantity * 0.2))) this.status = "LOW_STOCK";
    else this.status = "AVAILABLE";
  }

  next();
});

libraryBookSchema.index({ schoolId: 1, bookCode: 1 }, { unique: true });
libraryBookSchema.index({ schoolId: 1, title: 1, author: 1 });

const LibraryBook = mongoose.model("LibraryBook", libraryBookSchema);
export default LibraryBook;

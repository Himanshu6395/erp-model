import mongoose from "mongoose";

const globalAnnouncementSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "GLOBAL", enum: ["GLOBAL"] },
    message: { type: String, trim: true, maxlength: 2000, default: "" },
    isActive: { type: Boolean, default: false },
    /** Hours to show when published; null = until turned off manually */
    durationHours: { type: Number, default: null },
    /** Computed on save when active and durationHours is set; null = no auto-expiry */
    visibleUntil: { type: Date, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const GlobalAnnouncement = mongoose.model("GlobalAnnouncement", globalAnnouncementSchema);
export default GlobalAnnouncement;

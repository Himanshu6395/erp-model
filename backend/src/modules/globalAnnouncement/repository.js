import GlobalAnnouncement from "../../models/GlobalAnnouncement.js";

const KEY = "GLOBAL";

async function ensureDoc() {
  const existing = await GlobalAnnouncement.findOne({ key: KEY });
  if (existing) return existing;
  return GlobalAnnouncement.create({ key: KEY, message: "", isActive: false, durationHours: null, visibleUntil: null });
}

export const globalAnnouncementRepository = {
  async getRaw() {
    return ensureDoc();
  },

  async update({ message, isActive, userId, durationHours, visibleUntil }) {
    const set = {
      message: message ?? "",
      isActive: Boolean(isActive),
      updatedBy: userId || null,
      durationHours: durationHours ?? null,
      visibleUntil: visibleUntil ?? null,
    };
    return GlobalAnnouncement.findOneAndUpdate(
      { key: KEY },
      { $set: set },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  },
};

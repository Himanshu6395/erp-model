import AppError from "../../common/errors/AppError.js";
import { globalAnnouncementRepository } from "./repository.js";

const MAX_DURATION_HOURS = 720; // 30 days

function isPast(date) {
  if (!date) return false;
  return new Date(date).getTime() <= Date.now();
}

function toPublicPayload(doc, text) {
  const expired = Boolean(doc.isActive && doc.visibleUntil && isPast(doc.visibleUntil));
  const visible = Boolean(doc.isActive && text && !expired);
  return {
    message: visible ? text : null,
    updatedAt: doc.updatedAt,
    visibleUntil: visible && doc.visibleUntil ? doc.visibleUntil : null,
  };
}

function toAdminPayload(doc) {
  const text = (doc.message || "").trim();
  const expired = Boolean(doc.isActive && doc.visibleUntil && isPast(doc.visibleUntil));
  return {
    message: doc.message || "",
    isActive: Boolean(doc.isActive),
    updatedAt: doc.updatedAt,
    durationHours: doc.durationHours ?? null,
    visibleUntil: doc.visibleUntil || null,
    expired,
    visibleToSchools: Boolean(doc.isActive && text && !expired),
  };
}

export const globalAnnouncementService = {
  async getForSchoolPortal() {
    const doc = await globalAnnouncementRepository.getRaw();
    const text = (doc.message || "").trim();
    return toPublicPayload(doc, text);
  },

  async getForSuperAdmin() {
    const doc = await globalAnnouncementRepository.getRaw();
    return toAdminPayload(doc);
  },

  async setFromSuperAdmin(body, userId) {
    const current = await globalAnnouncementRepository.getRaw();

    let nextMessage = current.message || "";
    if (body.message !== undefined && body.message !== null) {
      nextMessage = typeof body.message === "string" ? body.message.trim() : "";
    }

    let nextDuration = current.durationHours ?? null;
    if (Object.prototype.hasOwnProperty.call(body, "durationHours")) {
      const raw = body.durationHours;
      if (raw === null || raw === "") {
        nextDuration = null;
      } else {
        const n = Number(raw);
        if (!Number.isInteger(n) || n < 1 || n > MAX_DURATION_HOURS) {
          throw new AppError(`Display duration must be between 1 and ${MAX_DURATION_HOURS} hours, or off for no auto-hide`, 400);
        }
        nextDuration = n;
      }
    }

    const active = Boolean(body.isActive);
    if (active && !nextMessage) {
      throw new AppError("Message is required when announcement is active", 400);
    }

    let visibleUntil = null;
    if (active) {
      if (nextDuration != null) {
        visibleUntil = new Date(Date.now() + nextDuration * 3600000);
      }
    }

    const doc = await globalAnnouncementRepository.update({
      message: nextMessage,
      isActive: active,
      userId,
      durationHours: nextDuration,
      visibleUntil,
    });

    return toAdminPayload(doc);
  },
};

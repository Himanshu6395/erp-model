import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import ClassModel from "../../models/Class.js";
import Notice from "../../models/Notice.js";
import { noticeRepository } from "./notice.repository.js";

const ensureSchoolAdmin = (user) => {
  if (!user?.schoolId) throw new AppError("School context missing for current user", 400);
  if (user.role !== ROLES.SCHOOL_ADMIN) throw new AppError("Only SCHOOL_ADMIN can manage notices", 403);
  return user.schoolId;
};

const parseDate = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const buildCreatePayload = (body, { userId, schoolId, file }) => {
  const description = String(body.description ?? body.message ?? "").trim();
  if (!description) throw new AppError("Description is required", 400);
  const title = String(body.title || "").trim();
  if (!title) throw new AppError("Title is required", 400);

  const classId = body.classId && String(body.classId).trim() ? body.classId : null;

  return {
    schoolId,
    title,
    description,
    message: description,
    noticeType: body.noticeType || "GENERAL",
    targetAudience: body.targetAudience || "BOTH",
    classId: classId || null,
    section: String(body.section || "").trim(),
    publishDate: parseDate(body.publishDate) || new Date(),
    expiryDate: parseDate(body.expiryDate),
    priority: body.priority || "MEDIUM",
    status: body.status || "PUBLISHED",
    createdBy: userId || null,
    attachmentUrl: file ? `/uploads/notices/${file.filename}` : String(body.attachmentUrl || "").trim() || "",
    attachmentOriginalName: file?.originalname
      ? String(file.originalname)
      : String(body.attachmentOriginalName || "").trim() || "",
  };
};

export const schoolAdminNoticeService = {
  async create(user, body, file) {
    const schoolId = ensureSchoolAdmin(user);
    const payload = buildCreatePayload(body, { userId: user.userId, schoolId, file });
    if (payload.classId) {
      const cls = await ClassModel.findOne({ _id: payload.classId, schoolId });
      if (!cls) throw new AppError("Class not found in your school", 404);
    }
    const created = await noticeRepository.create(payload);
    return Notice.findById(created._id).populate("classId");
  },

  async list(user, query) {
    const schoolId = ensureSchoolAdmin(user);
    return noticeRepository.findForAdmin({
      schoolId,
      targetAudience: query.targetAudience || "",
      status: query.status || "",
      from: query.from || "",
      to: query.to || "",
    });
  },

  async update(user, noticeId, body, file) {
    const schoolId = ensureSchoolAdmin(user);
    const existing = await noticeRepository.findByIdSchool({ schoolId, noticeId });
    if (!existing) throw new AppError("Notice not found", 404);

    const next = {};
    if (body.title !== undefined) next.title = String(body.title).trim();
    if (body.description !== undefined || body.message !== undefined) {
      const t = String(body.description ?? body.message ?? "").trim();
      if (t) {
        next.description = t;
        next.message = t;
      }
    }
    if (body.noticeType !== undefined) next.noticeType = body.noticeType;
    if (body.targetAudience !== undefined) next.targetAudience = body.targetAudience;
    if (body.section !== undefined) next.section = String(body.section || "").trim();
    if (body.publishDate !== undefined) next.publishDate = parseDate(body.publishDate);
    if (body.expiryDate !== undefined) next.expiryDate = parseDate(body.expiryDate);
    if (body.priority !== undefined) next.priority = body.priority;
    if (body.status !== undefined) next.status = body.status;

    if (body.classId !== undefined) {
      const cid = String(body.classId || "").trim();
      if (!cid) next.classId = null;
      else {
        const cls = await ClassModel.findOne({ _id: cid, schoolId });
        if (!cls) throw new AppError("Class not found in your school", 404);
        next.classId = cid;
      }
    }

    if (file) {
      next.attachmentUrl = `/uploads/notices/${file.filename}`;
      next.attachmentOriginalName = String(file.originalname || "");
    }

    await noticeRepository.updateByIdSchool({ schoolId, noticeId, payload: next });
    return Notice.findById(noticeId).populate("classId");
  },

  async remove(user, noticeId) {
    const schoolId = ensureSchoolAdmin(user);
    const deleted = await noticeRepository.deleteByIdSchool({ schoolId, noticeId });
    if (!deleted) throw new AppError("Notice not found", 404);
    return { deleted: true };
  },
};

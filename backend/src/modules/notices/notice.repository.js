import Notice from "../../models/Notice.js";
import {
  publishedNoticeQuery,
  audienceOrStudent,
  audienceOrTeacher,
  noticeVisibleToStudent,
  toPublicNotice,
} from "./notice.logic.js";

export const noticeRepository = {
  create: (payload) => Notice.create(payload),
  findByIdSchool: ({ schoolId, noticeId }) => Notice.findOne({ _id: noticeId, schoolId }),
  updateByIdSchool: ({ schoolId, noticeId, payload }) =>
    Notice.findOneAndUpdate({ _id: noticeId, schoolId }, payload, { new: true }),
  deleteByIdSchool: ({ schoolId, noticeId }) => Notice.findOneAndDelete({ _id: noticeId, schoolId }),

  /** All notices for school (admin list; includes drafts) */
  findForAdmin: async ({ schoolId, targetAudience, status, from, to }) => {
    const q = { schoolId };
    if (targetAudience && String(targetAudience).trim()) q.targetAudience = targetAudience;
    if (status && String(status).trim()) q.status = status;
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) {
        const t = new Date(to);
        t.setHours(23, 59, 59, 999);
        q.createdAt.$lte = t;
      }
    }
    const rows = await Notice.find(q).populate("classId").sort({ createdAt: -1 }).lean();
    return rows.map(toPublicNotice);
  },

  findPublishedForStudent: async ({ schoolId, student }) => {
    const rows = await Notice.find({
      schoolId,
      ...publishedNoticeQuery(),
      ...audienceOrStudent,
    })
      .populate("classId")
      .sort({ publishDate: -1, createdAt: -1 });
    return rows.filter((n) => noticeVisibleToStudent(n, student)).map(toPublicNotice);
  },

  findPublishedForTeacher: async ({ schoolId }) => {
    const rows = await Notice.find({
      schoolId,
      ...publishedNoticeQuery(),
      ...audienceOrTeacher,
    })
      .populate("classId")
      .sort({ publishDate: -1, createdAt: -1 })
      .lean();
    return rows.map(toPublicNotice);
  },
};

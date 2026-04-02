import Notice from "../../models/Notice.js";

export const noticeRepository = {
  findBySchool: ({ schoolId, limit }) =>
    Notice.find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(limit || 0),
};

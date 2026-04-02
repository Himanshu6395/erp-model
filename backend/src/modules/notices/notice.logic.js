/** Published + date window; legacy docs without status/dates still visible */
export const publishedNoticeQuery = (now = new Date()) => ({
  $and: [
    {
      $or: [{ status: "PUBLISHED" }, { status: { $exists: false } }, { status: null }],
    },
    {
      $or: [{ publishDate: null }, { publishDate: { $exists: false } }, { publishDate: { $lte: now } }],
    },
    {
      $or: [{ expiryDate: null }, { expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }],
    },
  ],
});

export const audienceOrStudent = {
  $or: [
    { targetAudience: "STUDENTS" },
    { targetAudience: "BOTH" },
    { targetAudience: { $exists: false } },
    { targetAudience: null },
  ],
};

export const audienceOrTeacher = {
  $or: [
    { targetAudience: "TEACHERS" },
    { targetAudience: "BOTH" },
    { targetAudience: { $exists: false } },
    { targetAudience: null },
  ],
};

export function noticeVisibleToStudent(notice, student) {
  const n = notice?.toObject ? notice.toObject() : notice || {};
  const stuCid = String(student?.classId?._id || student?.classId || "");
  const stuSec = String(student?.section || "").trim().toUpperCase();

  const nCid = n.classId ? String(n.classId._id || n.classId) : "";
  if (nCid && nCid !== stuCid) return false;

  const nSec = String(n.section || "").trim();
  if (!nSec) return true;
  return nSec.toUpperCase() === stuSec;
}

export function noticeBodyText(doc) {
  const o = doc?.toObject ? doc.toObject() : doc || {};
  return o.description || o.message || "";
}

export function toPublicNotice(doc) {
  const o = doc?.toObject ? doc.toObject() : { ...doc };
  const text = noticeBodyText(o);
  return {
    ...o,
    description: text,
    message: text,
  };
}

import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import { studentRepository } from "../student/repository.js";
import { examRepository } from "./exam.repository.js";

const ensureStudent = async (user) => {
  if (!user?.schoolId) throw new AppError("School context missing", 400);
  if (user.role !== ROLES.STUDENT) throw new AppError("Only students can access this resource", 403);
  const student = await studentRepository.findStudentByUser({ schoolId: user.schoolId, userId: user.userId });
  if (!student) throw new AppError("Student profile not found", 404);
  return student;
};

const isExamResultVisible = (examDoc) => {
  if (!examDoc || typeof examDoc !== "object") return true;
  if (examDoc.status && examDoc.status !== "PUBLISHED") return false;
  if (examDoc.resultPublishDate) {
    const d = new Date(examDoc.resultPublishDate);
    if (!Number.isNaN(d.getTime()) && d.getTime() > Date.now()) return false;
  }
  return true;
};

const getExamReportCard = async (user) => {
  const student = await ensureStudent(user);
  const schoolId = user.schoolId;
  const rows = await examRepository.findPublishedResultsStudent({ schoolId, studentId: student._id });
  const visible = rows.filter((r) => {
    if (r.resultStatus !== "PUBLISHED") return false;
    return isExamResultVisible(r.examId);
  });

  const byExam = new Map();
  for (const r of visible) {
    const ex = r.examId;
    const examKey = ex?._id ? String(ex._id) : "no-exam";
    if (!byExam.has(examKey)) {
      byExam.set(examKey, {
        exam: ex?._id
          ? {
              _id: ex._id,
              name: ex.name || ex.title,
              academicYear: ex.academicYear,
              term: ex.term,
              className: ex.classId?.name,
              section: ex.section,
              status: ex.status,
              resultPublishDate: ex.resultPublishDate,
            }
          : null,
        subjects: [],
      });
    }
    const subId = r.subjectId?._id || r.subjectId;
    byExam.get(examKey).subjects.push({
      subjectId: subId,
      subjectName: r.subject || r.subjectId?.name || "",
      marksComponents: r.marksComponents || {},
      marks: r.marks,
      totalMarks: r.totalMarks,
      percentage: r.percentage,
      grade: r.grade,
      passFail: r.passFail,
      rank: r.rank,
    });
  }

  const exams = [];
  for (const [, block] of byExam) {
    const enriched = [];
    for (const sub of block.subjects) {
      let classAveragePercentage = null;
      if (block.exam?._id && sub.subjectId) {
        const agg = await examRepository.avgPublishedPercentage({
          schoolId,
          examId: block.exam._id,
          subjectId: sub.subjectId,
        });
        if (agg?.length && agg[0].avg != null) classAveragePercentage = Number(Number(agg[0].avg).toFixed(2));
      }
      enriched.push({ ...sub, classAveragePercentage });
    }
    const overallPercentage = enriched.length
      ? Number((enriched.reduce((s, x) => s + (Number(x.percentage) || 0), 0) / enriched.length).toFixed(2))
      : 0;
    const fails = enriched.filter((x) => x.passFail === "FAIL").length;
    const overallPassFail = !enriched.length ? "PENDING" : fails === 0 ? "PASS" : "FAIL";
    exams.push({
      exam: block.exam,
      subjects: enriched,
      overallPercentage,
      overallPassFail,
    });
  }

  exams.sort((a, b) => {
    const da = a.exam?.resultPublishDate ? new Date(a.exam.resultPublishDate).getTime() : 0;
    const db = b.exam?.resultPublishDate ? new Date(b.exam.resultPublishDate).getTime() : 0;
    return db - da;
  });

  return {
    student: {
      name: student.userId?.name,
      rollNumber: student.rollNumber,
      section: student.section,
    },
    exams,
  };
};

export const examStudentService = {
  getExamReportCard,
};

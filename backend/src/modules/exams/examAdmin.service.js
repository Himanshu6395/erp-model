import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import ClassModel from "../../models/Class.js";
import Subject from "../../models/Subject.js";
import { examRepository } from "./exam.repository.js";
import { DEFAULT_GRADING_SCALE } from "./exam.utils.js";

const ensureAdmin = (user) => {
  if (!user?.schoolId) throw new AppError("School context missing", 400);
  if (user.role !== ROLES.SCHOOL_ADMIN) throw new AppError("Only school admin can manage exams", 403);
  return user.schoolId;
};

const createExamSession = async (user, body) => {
  const schoolId = ensureAdmin(user);
  const cls = await ClassModel.findOne({ schoolId, _id: body.classId });
  if (!cls) throw new AppError("Class not found", 404);
  const start = new Date(body.startDate);
  const end = new Date(body.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new AppError("Invalid dates", 400);
  if (end < start) throw new AppError("End date must be on or after start date", 400);
  const exam = await examRepository.createExam({
    schoolId,
    name: String(body.name || body.title || "").trim(),
    title: String(body.name || body.title || "").trim(),
    academicYear: String(body.academicYear || "2025-2026").trim(),
    term: String(body.term || "Term 1").trim(),
    classId: body.classId,
    section: String(body.section || "").trim(),
    examType: body.examType || "COMBINED",
    startDate: start,
    endDate: end,
    resultPublishDate: body.resultPublishDate ? new Date(body.resultPublishDate) : null,
    examDate: start,
    status: body.status || "DRAFT",
    gradingScale: Array.isArray(body.gradingScale) && body.gradingScale.length ? body.gradingScale : DEFAULT_GRADING_SCALE,
    settings: {
      graceMarksEnabled: !!body.settings?.graceMarksEnabled,
      graceMarksLimit: Number(body.settings?.graceMarksLimit || 0),
      roundingMode: body.settings?.roundingMode || "NEAREST",
      rankEnabled: body.settings?.rankEnabled !== false,
      attendanceMinPct: Number(body.settings?.attendanceMinPct || 0),
    },
    createdBy: null,
  });
  return exam;
};

const addExamSubject = async (user, examId, body) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);
  const subject = await Subject.findOne({ schoolId, _id: body.subjectId, classId: exam.classId._id || exam.classId });
  if (!subject) throw new AppError("Subject not found for this exam's class", 404);
  const existing = await examRepository.findExamSubject({ schoolId, examId, subjectId: body.subjectId });
  if (existing) throw new AppError("This subject is already configured for this exam", 400);

  const components = {
    theory: Number(body.components?.theory ?? body.theoryMax ?? 0),
    practical: Number(body.components?.practical ?? body.practicalMax ?? 0),
    internal: Number(body.components?.internal ?? body.internalMax ?? 0),
  };
  const sumComp = components.theory + components.practical + components.internal;
  const maxMarks = Number(body.maxMarks || sumComp || 100);
  if (sumComp > 0 && Math.abs(sumComp - maxMarks) > 0.01) {
    /* allow mismatch: maxMarks is authoritative total cap */
  }

  const row = await examRepository.createExamSubject({
    schoolId,
    examId,
    subjectId: body.subjectId,
    subjectName: subject.name,
    subjectCode: String(body.subjectCode || "").trim(),
    maxMarks,
    passingMarks: Number(body.passingMarks ?? 40),
    components,
    weightage: {
      theory: Number(body.weightage?.theory ?? 0),
      practical: Number(body.weightage?.practical ?? 0),
      internal: Number(body.weightage?.internal ?? 0),
    },
  });
  return row;
};

const listExamSessions = async (user, query) => {
  const schoolId = ensureAdmin(user);
  return examRepository.listExamsSchool({ schoolId, classId: query.classId || undefined, status: query.status || undefined });
};

const updateExamSession = async (user, examId, body) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);
  const $set = {};
  if (body.status) $set.status = body.status;
  if (body.name != null && String(body.name).trim()) {
    $set.name = String(body.name).trim();
    $set.title = $set.name;
  }
  if (body.academicYear != null) $set.academicYear = String(body.academicYear).trim();
  if (body.term != null) $set.term = String(body.term).trim();
  if (body.examType) $set.examType = body.examType;
  if (body.startDate) $set.startDate = new Date(body.startDate);
  if (body.endDate) $set.endDate = new Date(body.endDate);
  if (body.resultPublishDate !== undefined) {
    $set.resultPublishDate = body.resultPublishDate ? new Date(body.resultPublishDate) : null;
  }
  if (Array.isArray(body.gradingScale) && body.gradingScale.length) $set.gradingScale = body.gradingScale;
  if (body.settings && typeof body.settings === "object") {
    const prev = exam.settings || {};
    $set.settings = {
      graceMarksEnabled: body.settings.graceMarksEnabled ?? prev.graceMarksEnabled,
      graceMarksLimit: Number(body.settings.graceMarksLimit ?? prev.graceMarksLimit ?? 0),
      roundingMode: body.settings.roundingMode || prev.roundingMode || "NEAREST",
      rankEnabled: body.settings.rankEnabled !== undefined ? !!body.settings.rankEnabled : prev.rankEnabled !== false,
      attendanceMinPct: Number(body.settings.attendanceMinPct ?? prev.attendanceMinPct ?? 0),
    };
  }
  if (!Object.keys($set).length) return exam;
  return examRepository.updateExamById({ schoolId, examId, patch: { $set } });
};

const getExamSession = async (user, examId) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);
  const subjects = await examRepository.listExamSubjects({ examId });
  return { exam, subjects };
};

const getExamDashboard = async (user, examId) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);
  const subjects = await examRepository.listExamSubjects({ examId });
  const subjectStats = [];
  for (const sub of subjects) {
    const sid = sub.subjectId?._id || sub.subjectId;
    const rows = await examRepository.findResultsExamSubject({ schoolId, examId, subjectId: sid });
    const published = rows.filter((r) => r.resultStatus === "PUBLISHED");
    const pass = published.filter((r) => r.passFail === "PASS").length;
    const avg =
      published.length > 0 ? Number((published.reduce((s, r) => s + (r.percentage || 0), 0) / published.length).toFixed(2)) : 0;
    const top = [...published].sort((a, b) => (b.percentage || 0) - (a.percentage || 0)).slice(0, 5);
    subjectStats.push({
      subjectId: sid,
      subjectName: sub.subjectName,
      configuredMax: sub.maxMarks,
      resultCount: rows.length,
      publishedCount: published.length,
      passRate: published.length ? Number(((pass / published.length) * 100).toFixed(2)) : 0,
      averagePercentage: avg,
      topPerformers: top.map((r) => ({
        studentId: r.studentId?._id || r.studentId,
        name: r.studentId?.userId?.name || "",
        percentage: r.percentage,
        grade: r.grade,
      })),
    });
  }
  return { exam, subjects, subjectStats };
};

export const examAdminService = {
  createExamSession,
  addExamSubject,
  listExamSessions,
  getExamSession,
  updateExamSession,
  getExamDashboard,
};

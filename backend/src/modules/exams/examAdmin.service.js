import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import ClassModel from "../../models/Class.js";
import Student from "../../models/Student.js";
import Subject from "../../models/Subject.js";
import Teacher from "../../models/Teacher.js";
import { examRepository } from "./exam.repository.js";
import { DEFAULT_GRADING_SCALE, gradeFromPercentage } from "./exam.utils.js";

const ensureAdmin = (user) => {
  if (!user?.schoolId) throw new AppError("School context missing", 400);
  if (user.role !== ROLES.SCHOOL_ADMIN) throw new AppError("Only school admin can manage exams", 403);
  return user.schoolId;
};

const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeExamStatus = (value, startDate, endDate) => {
  const incoming = String(value || "").toUpperCase();
  if (["DRAFT", "UPCOMING", "ONGOING", "COMPLETED", "PUBLISHED"].includes(incoming)) return incoming;
  const now = Date.now();
  if (startDate && new Date(startDate).getTime() > now) return "UPCOMING";
  if (endDate && new Date(endDate).getTime() < now) return "COMPLETED";
  return "ONGOING";
};

const validateMarksRange = (obtained, maxMarks, label) => {
  const value = Number(obtained || 0);
  const max = Number(maxMarks || 0);
  if (value < 0) throw new AppError(`${label} cannot be negative`, 400);
  if (max > 0 && value > max) throw new AppError(`${label} cannot exceed max marks`, 400);
  return value;
};

const computeDivision = (percentage) => {
  if (percentage >= 60) return "FIRST";
  if (percentage >= 45) return "SECOND";
  if (percentage >= 33) return "THIRD";
  return "FAIL";
};

const computeGpa = (percentage) => Number(Math.min(10, Math.max(0, (Number(percentage || 0) / 10))).toFixed(2));

const computeOverallSummary = (rows, exam) => {
  const totalMarksObtained = Number(rows.reduce((sum, row) => sum + Number(row.marksObtained ?? row.marks ?? 0), 0).toFixed(2));
  const totalMaxMarks = Number(rows.reduce((sum, row) => sum + Number(row.maxMarks ?? row.totalMarks ?? 0), 0).toFixed(2));
  const percentage = totalMaxMarks > 0 ? Number(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)) : 0;
  const overallGrade = gradeFromPercentage(percentage, exam?.gradingScale || DEFAULT_GRADING_SCALE);
  const finalResultStatus = rows.every((row) => String(row.finalResultStatus || row.resultStatusFlag || row.passFail || "PASS") === "PASS")
    ? "PASS"
    : "FAIL";
  return {
    totalMarksObtained,
    totalMaxMarks,
    percentage,
    overallGrade,
    division: computeDivision(percentage),
    finalResultStatus,
    promotionStatus: finalResultStatus === "PASS" ? "PROMOTED" : "NOT_PROMOTED",
    gpa: computeGpa(percentage),
    cgpa: computeGpa(percentage),
  };
};

const rebuildStudentOverall = async (schoolId, examId, studentId, exam) => {
  const rows = await examRepository.listExamResults({ schoolId, examId });
  const mine = rows.filter((row) => String(row.studentId?._id || row.studentId) === String(studentId));
  if (!mine.length) return null;
  const summary = computeOverallSummary(mine, exam);
  for (const row of mine) {
    await examRepository.updateResultById({
      schoolId,
      resultId: row._id,
      patch: {
        $set: {
          totalMarksObtained: summary.totalMarksObtained,
          totalMaxMarks: summary.totalMaxMarks,
          overallGrade: summary.overallGrade,
          division: summary.division,
          finalResultStatus: summary.finalResultStatus,
          promotionStatus: summary.promotionStatus,
        },
      },
    });
  }
  return summary;
};

const createExamSession = async (user, body) => {
  const schoolId = ensureAdmin(user);
  const cls = await ClassModel.findOne({ schoolId, _id: body.classId });
  if (!cls) throw new AppError("Class not found", 404);

  const start = toDate(body.startDate);
  const end = toDate(body.endDate);
  if (!start || !end) throw new AppError("Invalid dates", 400);
  if (end < start) throw new AppError("End date must be on or after start date", 400);

  return examRepository.createExam({
    schoolId,
    name: String(body.name || body.examName || body.title || "").trim(),
    title: String(body.name || body.examName || body.title || "").trim(),
    academicYear: String(body.academicYear || "2025-2026").trim(),
    term: String(body.term || body.examTerm || "Term 1").trim(),
    classId: body.classId,
    section: String(body.section || "").trim(),
    sectionId: String(body.sectionId || body.section || "").trim(),
    examType: body.examType || "COMBINED",
    startDate: start,
    endDate: end,
    description: String(body.description || "").trim(),
    resultPublishDate: body.resultPublishDate ? new Date(body.resultPublishDate) : null,
    examDate: start,
    status: normalizeExamStatus(body.status, start, end),
    gradingScale: Array.isArray(body.gradingScale) && body.gradingScale.length ? body.gradingScale : DEFAULT_GRADING_SCALE,
    settings: {
      graceMarksEnabled: !!body.settings?.graceMarksEnabled,
      graceMarksLimit: Number(body.settings?.graceMarksLimit || 0),
      roundingMode: body.settings?.roundingMode || "NEAREST",
      rankEnabled: body.settings?.rankEnabled !== false,
      attendanceMinPct: Number(body.settings?.attendanceMinPct || 0),
      autoGradeCalculation: body.settings?.autoGradeCalculation !== false,
      gpaCalculationEnabled: body.settings?.gpaCalculationEnabled !== false,
      cgpaCalculationEnabled: body.settings?.cgpaCalculationEnabled !== false,
      resultPublished: !!body.settings?.resultPublished,
      resultLocked: !!body.settings?.resultLocked,
      meritListEnabled: body.settings?.meritListEnabled !== false,
      smsNotificationEnabled: !!body.settings?.smsNotificationEnabled,
      emailNotificationEnabled: !!body.settings?.emailNotificationEnabled,
    },
    createdBy: user.userId || null,
    updatedBy: user.userId || null,
  });
};

const addExamSubject = async (user, examId, body) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);

  const subject = await Subject.findOne({ schoolId, _id: body.subjectId, classId: exam.classId?._id || exam.classId });
  if (!subject) throw new AppError("Subject not found for this exam's class", 404);

  const existing = await examRepository.findExamSubject({ schoolId, examId, subjectId: body.subjectId });
  if (existing) throw new AppError("This subject is already configured for this exam", 400);

  const components = {
    theory: Number(body.components?.theory ?? body.theoryMax ?? 0),
    practical: Number(body.components?.practical ?? body.practicalMax ?? 0),
    internal: Number(body.components?.internal ?? body.internalMax ?? 0),
  };
  const maxMarks = Number(body.maxMarks || components.theory + components.practical + components.internal || 100);
  const passingMarks = Number(body.passingMarks ?? 40);
  if (passingMarks > maxMarks) throw new AppError("Passing marks cannot exceed max marks", 400);

  return examRepository.createExamSubject({
    schoolId,
    examId,
    subjectId: body.subjectId,
    subjectName: subject.name,
    subjectCode: String(body.subjectCode || "").trim(),
    maxMarks,
    passingMarks,
    examType: String(body.examType || "WRITTEN").toUpperCase(),
    isInternal: body.isInternal === true || body.isInternal === "true",
    components,
    weightage: {
      theory: Number(body.weightage?.theory ?? body.weightage ?? 0),
      practical: Number(body.weightage?.practical ?? 0),
      internal: Number(body.weightage?.internal ?? 0),
    },
  });
};

const updateExamSubject = async (user, examSubjectId, body) => {
  const schoolId = ensureAdmin(user);
  const existing = await examRepository.findExamSubjectById({ schoolId, id: examSubjectId });
  if (!existing) throw new AppError("Exam subject configuration not found", 404);

  const nextMaxMarks = body.maxMarks !== undefined ? Number(body.maxMarks) : existing.maxMarks;
  const nextPassingMarks = body.passingMarks !== undefined ? Number(body.passingMarks) : existing.passingMarks;
  if (nextPassingMarks > nextMaxMarks) throw new AppError("Passing marks cannot exceed max marks", 400);

  return examRepository.updateExamSubjectById({
    schoolId,
    examSubjectId,
    patch: {
      $set: {
        subjectCode: body.subjectCode !== undefined ? String(body.subjectCode || "").trim() : existing.subjectCode,
        maxMarks: nextMaxMarks,
        passingMarks: nextPassingMarks,
        examType: body.examType ? String(body.examType).toUpperCase() : existing.examType,
        isInternal: body.isInternal !== undefined ? body.isInternal === true || body.isInternal === "true" : existing.isInternal,
        components: body.components || existing.components,
        weightage: body.weightage || existing.weightage,
      },
    },
  });
};

const deleteExamSubject = async (user, examSubjectId) => {
  const schoolId = ensureAdmin(user);
  const existing = await examRepository.findExamSubjectById({ schoolId, id: examSubjectId });
  if (!existing) throw new AppError("Exam subject configuration not found", 404);
  await examRepository.deleteExamSubjectById({ schoolId, examSubjectId });
  return { deleted: true };
};

const createExamSchedule = async (user, examId, body) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);
  const examSubject = await examRepository.findExamSubject({ schoolId, examId, subjectId: body.subjectId });
  if (!examSubject) throw new AppError("Configure the subject for this exam first", 400);

  let invigilatorName = "";
  if (body.invigilatorId) {
    const teacher = await Teacher.findOne({ schoolId, _id: body.invigilatorId }).populate("userId");
    if (!teacher) throw new AppError("Invigilator not found", 404);
    invigilatorName = teacher.userId?.name || "";
  }

  return examRepository.createExamSchedule({
    schoolId,
    examId,
    subjectId: body.subjectId,
    subjectName: examSubject.subjectName,
    subjectCode: body.subjectCode || examSubject.subjectCode || "",
    examDate: new Date(body.examDate),
    startTime: String(body.startTime || "").trim(),
    endTime: String(body.endTime || "").trim(),
    duration: Number(body.duration || 0),
    roomNumber: String(body.roomNumber || "").trim(),
    invigilatorId: body.invigilatorId || null,
    invigilatorName,
  });
};

const updateExamSchedule = async (user, scheduleId, body) => {
  const schoolId = ensureAdmin(user);
  const existing = await examRepository.findExamScheduleById({ schoolId, scheduleId });
  if (!existing) throw new AppError("Exam schedule not found", 404);

  let invigilatorName = existing.invigilatorName || "";
  if (body.invigilatorId) {
    const teacher = await Teacher.findOne({ schoolId, _id: body.invigilatorId }).populate("userId");
    if (!teacher) throw new AppError("Invigilator not found", 404);
    invigilatorName = teacher.userId?.name || "";
  }

  return examRepository.updateExamScheduleById({
    schoolId,
    scheduleId,
    patch: {
      $set: {
        examDate: body.examDate ? new Date(body.examDate) : existing.examDate,
        startTime: body.startTime ?? existing.startTime,
        endTime: body.endTime ?? existing.endTime,
        duration: body.duration !== undefined ? Number(body.duration || 0) : existing.duration,
        roomNumber: body.roomNumber !== undefined ? String(body.roomNumber || "").trim() : existing.roomNumber,
        invigilatorId: body.invigilatorId !== undefined ? body.invigilatorId || null : existing.invigilatorId?._id || existing.invigilatorId,
        invigilatorName,
      },
    },
  });
};

const deleteExamSchedule = async (user, scheduleId) => {
  const schoolId = ensureAdmin(user);
  const existing = await examRepository.findExamScheduleById({ schoolId, scheduleId });
  if (!existing) throw new AppError("Exam schedule not found", 404);
  await examRepository.deleteExamScheduleById({ schoolId, scheduleId });
  return { deleted: true };
};

const listExamSessions = async (user, query) => {
  const schoolId = ensureAdmin(user);
  return examRepository.listExamsSchool({ schoolId, classId: query.classId || undefined, status: query.status || undefined });
};

const updateExamSession = async (user, examId, body) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);

  const startDate = body.startDate ? new Date(body.startDate) : exam.startDate;
  const endDate = body.endDate ? new Date(body.endDate) : exam.endDate;
  if (endDate < startDate) throw new AppError("End date must be on or after start date", 400);

  const patch = {
    $set: {
      updatedBy: user.userId || null,
      status: normalizeExamStatus(body.status || exam.status, startDate, endDate),
    },
  };

  if (body.name != null && String(body.name).trim()) {
    patch.$set.name = String(body.name).trim();
    patch.$set.title = patch.$set.name;
  }
  if (body.academicYear != null) patch.$set.academicYear = String(body.academicYear).trim();
  if (body.term != null) patch.$set.term = String(body.term).trim();
  if (body.section != null) patch.$set.section = String(body.section).trim();
  if (body.sectionId != null) patch.$set.sectionId = String(body.sectionId).trim();
  if (body.description != null) patch.$set.description = String(body.description).trim();
  if (body.examType) patch.$set.examType = body.examType;
  if (body.startDate) patch.$set.startDate = startDate;
  if (body.endDate) patch.$set.endDate = endDate;
  if (body.resultPublishDate !== undefined) patch.$set.resultPublishDate = body.resultPublishDate ? new Date(body.resultPublishDate) : null;
  if (Array.isArray(body.gradingScale) && body.gradingScale.length) patch.$set.gradingScale = body.gradingScale;
  if (body.settings && typeof body.settings === "object") {
    const previous = exam.settings || {};
    patch.$set.settings = {
      graceMarksEnabled: body.settings.graceMarksEnabled ?? previous.graceMarksEnabled,
      graceMarksLimit: Number(body.settings.graceMarksLimit ?? previous.graceMarksLimit ?? 0),
      roundingMode: body.settings.roundingMode || previous.roundingMode || "NEAREST",
      rankEnabled: body.settings.rankEnabled !== undefined ? !!body.settings.rankEnabled : previous.rankEnabled !== false,
      attendanceMinPct: Number(body.settings.attendanceMinPct ?? previous.attendanceMinPct ?? 0),
      autoGradeCalculation: body.settings.autoGradeCalculation !== undefined ? !!body.settings.autoGradeCalculation : previous.autoGradeCalculation !== false,
      gpaCalculationEnabled: body.settings.gpaCalculationEnabled !== undefined ? !!body.settings.gpaCalculationEnabled : previous.gpaCalculationEnabled !== false,
      cgpaCalculationEnabled: body.settings.cgpaCalculationEnabled !== undefined ? !!body.settings.cgpaCalculationEnabled : previous.cgpaCalculationEnabled !== false,
      resultPublished: body.settings.resultPublished !== undefined ? !!body.settings.resultPublished : !!previous.resultPublished,
      resultLocked: body.settings.resultLocked !== undefined ? !!body.settings.resultLocked : !!previous.resultLocked,
      meritListEnabled: body.settings.meritListEnabled !== undefined ? !!body.settings.meritListEnabled : previous.meritListEnabled !== false,
      smsNotificationEnabled: body.settings.smsNotificationEnabled !== undefined ? !!body.settings.smsNotificationEnabled : !!previous.smsNotificationEnabled,
      emailNotificationEnabled: body.settings.emailNotificationEnabled !== undefined ? !!body.settings.emailNotificationEnabled : !!previous.emailNotificationEnabled,
    };
  }

  return examRepository.updateExamById({ schoolId, examId, patch });
};

const deleteExamSession = async (user, examId) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);
  await examRepository.deleteExamSchedulesByExamId({ schoolId, examId });
  await examRepository.deleteResultsByExamId({ schoolId, examId });
  await examRepository.deleteExamById({ schoolId, examId });
  return { deleted: true };
};

const getExamSession = async (user, examId) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);
  const [subjects, schedules, results, reportCards] = await Promise.all([
    examRepository.listExamSubjects({ examId }),
    examRepository.listExamSchedules({ examId }),
    examRepository.listExamResults({ schoolId, examId }),
    examRepository.listReportCards({ schoolId, examId }),
  ]);
  return { exam, subjects, schedules, results, reportCards };
};

const upsertExamResults = async (user, examId, body) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);
  if (exam.settings?.resultLocked) throw new AppError("Results are locked for this exam", 403);
  if (!Array.isArray(body.entries) || !body.entries.length) throw new AppError("entries[] is required", 400);

  const saved = [];
  for (const entry of body.entries) {
    const student = await Student.findOne({ schoolId, _id: entry.studentId });
    if (!student) throw new AppError("Student not found", 404);
    const examSubject = await examRepository.findExamSubject({ schoolId, examId, subjectId: entry.subjectId });
    if (!examSubject) throw new AppError("Exam subject configuration not found", 404);

    const internalMarks = validateMarksRange(entry.internalMarks ?? entry.marksComponents?.internal ?? 0, examSubject.components?.internal || examSubject.maxMarks, "Internal marks");
    const practicalMarks = validateMarksRange(entry.practicalMarks ?? entry.marksComponents?.practical ?? 0, examSubject.components?.practical || examSubject.maxMarks, "Practical marks");
    const theoryMarks = validateMarksRange(
      entry.marksObtained ?? entry.theoryMarks ?? entry.marksComponents?.theory ?? 0,
      examSubject.components?.theory || examSubject.maxMarks,
      "Marks obtained"
    );
    const vivaMarks = validateMarksRange(entry.vivaMarks ?? 0, examSubject.maxMarks, "Viva marks");
    const graceMarks = validateMarksRange(entry.graceMarks ?? 0, examSubject.maxMarks, "Grace marks");

    const marksObtained = Number((theoryMarks + internalMarks + practicalMarks + vivaMarks + graceMarks).toFixed(2));
    if (marksObtained > examSubject.maxMarks) throw new AppError("Total marks obtained cannot exceed max marks", 400);

    const percentage = examSubject.maxMarks > 0 ? Number(((marksObtained / examSubject.maxMarks) * 100).toFixed(2)) : 0;
    const grade = gradeFromPercentage(percentage, exam.gradingScale || DEFAULT_GRADING_SCALE);
    const finalResultStatus = marksObtained >= examSubject.passingMarks ? "PASS" : "FAIL";

    const row = await examRepository.upsertExamResult({
      filter: {
        schoolId,
        studentId: entry.studentId,
        examId,
        examSubjectKey: String(entry.subjectId),
      },
      payload: {
        schoolId,
        studentId: entry.studentId,
        examId,
        subjectId: entry.subjectId,
        examSubjectKey: String(entry.subjectId),
        subject: examSubject.subjectName,
        marksComponents: {
          theory: theoryMarks,
          practical: practicalMarks,
          internal: internalMarks,
        },
        teacherId: entry.teacherId || null,
        marks: marksObtained,
        marksObtained,
        totalMarks: examSubject.maxMarks,
        maxMarks: examSubject.maxMarks,
        passingMarks: examSubject.passingMarks,
        percentage,
        grade,
        passFail: finalResultStatus,
        resultStatusFlag: finalResultStatus,
        resultStatus: body.publishNow || exam.settings?.resultPublished ? "PUBLISHED" : "DRAFT",
        remarks: entry.remarks || "",
        internalMarks,
        practicalMarks,
        vivaMarks,
        graceMarks,
        attendancePercentage: Number(entry.attendancePercentage || exam.settings?.attendanceMinPct || 0),
        reEvaluationStatus: entry.reEvaluationStatus || "NOT_REQUESTED",
        supplementaryFlag: entry.supplementaryFlag === true || entry.supplementaryFlag === "true",
        teacherRemarks: entry.teacherRemarks || "",
        principalRemarks: entry.principalRemarks || "",
        strengths: entry.strengths || "",
        improvements: entry.improvements || "",
        finalResultStatus,
        promotionStatus: finalResultStatus === "PASS" ? "PROMOTED" : "NOT_PROMOTED",
      },
    });
    saved.push(row);
    await rebuildStudentOverall(schoolId, examId, entry.studentId, exam);
  }
  return { saved: saved.length, items: saved };
};

const listExamResults = async (user, examId) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);
  const rows = await examRepository.listExamResults({ schoolId, examId });

  const byStudent = new Map();
  for (const row of rows) {
    const studentId = String(row.studentId?._id || row.studentId);
    if (!byStudent.has(studentId)) {
      byStudent.set(studentId, {
        studentId,
        studentName: row.studentId?.userId?.name || "",
        rollNumber: row.studentId?.rollNumber || "",
        subjects: [],
      });
    }
    byStudent.get(studentId).subjects.push(row);
  }

  const students = [];
  for (const block of byStudent.values()) {
    const summary = computeOverallSummary(block.subjects, exam);
    students.push({ ...block, ...summary });
  }

  students.sort((a, b) => b.percentage - a.percentage);
  return { exam, rows, students };
};

const publishExamResults = async (user, examId, body) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);

  const settings = {
    ...(exam.settings || {}),
    resultPublished: body.resultPublished !== undefined ? !!body.resultPublished : true,
    resultLocked: body.resultLocked !== undefined ? !!body.resultLocked : exam.settings?.resultLocked || false,
  };

  const nextStatus = settings.resultPublished ? "PUBLISHED" : body.status || exam.status || "COMPLETED";
  const updated = await examRepository.updateExamById({
    schoolId,
    examId,
    patch: {
      $set: {
        status: nextStatus,
        updatedBy: user.userId || null,
        settings,
      },
    },
  });

  const rows = await examRepository.listExamResults({ schoolId, examId });
  for (const row of rows) {
    await examRepository.updateResultById({
      schoolId,
      resultId: row._id,
      patch: { $set: { resultStatus: settings.resultPublished ? "PUBLISHED" : "DRAFT" } },
    });
  }

  return updated;
};

const generateReportCards = async (user, examId, body = {}) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);

  const { students } = await listExamResults(user, examId);
  const meritList = [...students].sort((a, b) => b.percentage - a.percentage);
  const cards = [];

  for (let index = 0; index < meritList.length; index += 1) {
    const item = meritList[index];
    const card = await examRepository.upsertReportCard({
      filter: { schoolId, examId, studentId: item.studentId },
      payload: {
        schoolId,
        examId,
        studentId: item.studentId,
        totalMarksObtained: item.totalMarksObtained,
        totalMaxMarks: item.totalMaxMarks,
        percentage: item.percentage,
        overallGrade: item.overallGrade,
        rank: index + 1,
        division: item.division,
        finalResultStatus: item.finalResultStatus,
        promotionStatus: item.promotionStatus,
        generatedDate: new Date(),
        generatedBy: user.userId || null,
        pdfUrl: String(body.pdfUrl || "").trim(),
        signature: String(body.signature || "").trim(),
      },
    });
    cards.push(card);
  }

  return { generated: cards.length, cards };
};

const listReportCards = async (user, examId) => {
  const schoolId = ensureAdmin(user);
  return examRepository.listReportCards({ schoolId, examId });
};

const deleteExamResult = async (user, resultId) => {
  const schoolId = ensureAdmin(user);
  await examRepository.deleteResultById({ schoolId, resultId });
  return { deleted: true };
};

const deleteReportCard = async (user, reportCardId) => {
  const schoolId = ensureAdmin(user);
  await examRepository.deleteReportCardById({ schoolId, reportCardId });
  return { deleted: true };
};

const getMeritList = async (user, examId) => {
  const { students } = await listExamResults(user, examId);
  return students
    .sort((a, b) => b.percentage - a.percentage)
    .map((item, index) => ({
      studentId: item.studentId,
      studentName: item.studentName,
      rollNumber: item.rollNumber,
      percentage: item.percentage,
      totalMarksObtained: item.totalMarksObtained,
      totalMaxMarks: item.totalMaxMarks,
      overallGrade: item.overallGrade,
      rank: index + 1,
      division: item.division,
    }));
};

const getExamDashboard = async (user, examId) => {
  const schoolId = ensureAdmin(user);
  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);

  const [subjects, schedules, rows, reportCards] = await Promise.all([
    examRepository.listExamSubjects({ examId }),
    examRepository.listExamSchedules({ examId }),
    examRepository.listExamResults({ schoolId, examId }),
    examRepository.listReportCards({ schoolId, examId }),
  ]);

  const subjectStats = [];
  for (const sub of subjects) {
    const sid = sub.subjectId?._id || sub.subjectId;
    const results = rows.filter((row) => String(row.subjectId?._id || row.subjectId) === String(sid));
    const published = results.filter((row) => row.resultStatus === "PUBLISHED");
    const pass = published.filter((row) => (row.finalResultStatus || row.resultStatusFlag || row.passFail) === "PASS").length;
    subjectStats.push({
      subjectId: sid,
      subjectName: sub.subjectName,
      configuredMax: sub.maxMarks,
      resultCount: results.length,
      publishedCount: published.length,
      scheduleCount: schedules.filter((schedule) => String(schedule.subjectId?._id || schedule.subjectId) === String(sid)).length,
      passRate: published.length ? Number(((pass / published.length) * 100).toFixed(2)) : 0,
      averagePercentage: published.length
        ? Number((published.reduce((sum, row) => sum + Number(row.percentage || 0), 0) / published.length).toFixed(2))
        : 0,
    });
  }

  return {
    exam,
    subjects,
    schedules,
    reportCards,
    subjectStats,
    totals: {
      configuredSubjects: subjects.length,
      scheduledPapers: schedules.length,
      resultRows: rows.length,
      generatedReportCards: reportCards.length,
      published: !!exam.settings?.resultPublished,
      locked: !!exam.settings?.resultLocked,
    },
  };
};

export const examAdminService = {
  createExamSession,
  addExamSubject,
  updateExamSubject,
  deleteExamSubject,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  listExamSessions,
  getExamSession,
  updateExamSession,
  deleteExamSession,
  upsertExamResults,
  listExamResults,
  deleteExamResult,
  publishExamResults,
  generateReportCards,
  listReportCards,
  deleteReportCard,
  getMeritList,
  getExamDashboard,
};

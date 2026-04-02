import AppError from "../../common/errors/AppError.js";
import { teacherRepository } from "../teacher/repository.js";
import { examRepository } from "./exam.repository.js";
import {
  applyGraceMarks,
  applyRounding,
  cap,
  computePercentage,
  gradeFromPercentage,
  maxTotalFromComponents,
  sumComponentsObtained,
} from "./exam.utils.js";

const getTeacherContext = async (user) => {
  const schoolId = user?.schoolId;
  if (!schoolId) throw new AppError("School context missing", 400);
  const teacher = await teacherRepository.findTeacherByUser({ schoolId, userId: user.userId });
  if (!teacher) throw new AppError("Teacher profile not found", 404);
  const [asClassTeacher, subs] = await Promise.all([
    teacherRepository.findAssignedClassesByClassTeacher({ schoolId, teacherId: teacher._id }),
    teacherRepository.findAssignedSubjects({ schoolId, teacherId: teacher._id }),
  ]);
  const classIdSet = new Set([
    ...asClassTeacher.map((c) => String(c._id)),
    ...subs.map((s) => String(s.classId?._id || s.classId)),
  ]);
  return { schoolId, teacher, assignedClassIds: [...classIdSet] };
};

const assertClass = (assignedClassIds, classId) => {
  if (!assignedClassIds.includes(String(classId))) throw new AppError("You are not assigned to this class", 403);
};

const assertTeachesSubject = async (schoolId, teacherId, classId, subjectId) => {
  const sub = await teacherRepository.findSubjectInClass({ schoolId, subjectId, classId });
  if (!sub) throw new AppError("Subject not found for this class", 404);
  if (String(sub.teacherId) !== String(teacherId) && sub.teacherId) {
    const asCT = await teacherRepository.findAssignedClassesByClassTeacher({ schoolId, teacherId });
    const isClassTeacher = asCT.some((c) => String(c._id) === String(classId));
    if (!isClassTeacher) throw new AppError("You can only enter marks for subjects you teach or as class teacher", 403);
  }
};

const canEditResult = (exam, existing) => {
  if (exam.status === "PUBLISHED" && existing?.resultStatus === "PUBLISHED") return false;
  if (existing?.resultStatus === "PUBLISHED" && exam.status === "COMPLETED") return false;
  return true;
};

const recomputeRanks = async (schoolId, examId, subjectId) => {
  const rows = await examRepository.findResultsExamSubject({ schoolId, examId, subjectId });
  const published = rows.filter((r) => r.resultStatus === "PUBLISHED");
  published.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  let rank = 1;
  for (const r of published) {
    await examRepository.setResultRank({ resultId: r._id, rank });
    rank += 1;
  }
};

const getMarksTeacher = async (user, query) => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  const { examId, subjectId, classId, section } = query;
  if (!examId || !subjectId || !classId || !section) throw new AppError("examId, subjectId, classId and section are required", 400);
  assertClass(assignedClassIds, classId);
  await assertTeachesSubject(schoolId, teacher._id, classId, subjectId);

  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);
  if (String(exam.classId?._id || exam.classId) !== String(classId)) throw new AppError("Exam does not belong to this class", 400);

  const exSub = await examRepository.findExamSubject({ schoolId, examId, subjectId });
  if (!exSub) throw new AppError("Subject is not configured for this exam. Ask admin to add it.", 404);

  const students = await teacherRepository.findStudentsByClassIds({
    schoolId,
    classIds: [classId],
    section: String(section).trim(),
    search: "",
    skip: 0,
    limit: 5000,
  });

  const existingRows = await examRepository.findResultsExamSubject({ schoolId, examId, subjectId });
  const byStudent = new Map(existingRows.map((r) => [String(r.studentId._id || r.studentId), r]));

  const grid = students.map((s) => {
    const ex = byStudent.get(String(s._id));
    return {
      studentId: s._id,
      rollNumber: s.rollNumber,
      name: s.userId?.name || "",
      marksComponents: {
        theory: ex?.marksComponents?.theory ?? null,
        practical: ex?.marksComponents?.practical ?? null,
        internal: ex?.marksComponents?.internal ?? null,
      },
      total: ex?.marks ?? null,
      maxTotal: exSub.maxMarks,
      percentage: ex?.percentage ?? null,
      grade: ex?.grade ?? "",
      passFail: ex?.passFail ?? null,
      rank: ex?.rank ?? null,
      resultStatus: ex?.resultStatus ?? null,
      locked: ex?.resultStatus === "PUBLISHED" && exam.status === "PUBLISHED",
    };
  });

  return {
    exam: { _id: exam._id, name: exam.name, status: exam.status, resultPublishDate: exam.resultPublishDate },
    examSubject: {
      subjectId: exSub.subjectId,
      subjectName: exSub.subjectName,
      maxMarks: exSub.maxMarks,
      passingMarks: exSub.passingMarks,
      components: exSub.components,
      weightage: exSub.weightage,
    },
    students: grid,
  };
};

const buildComputedPayload = (exSub, exam, entry, teacherId, subjectName, resultStatus) => {
  const compMax = exSub.components || {};
  const theory = cap(entry.theory, compMax.theory || 0);
  const practical = cap(entry.practical, compMax.practical || 0);
  const internal = cap(entry.internal, compMax.internal || 0);
  const marksComponents = { theory, practical, internal };
  let obtained = sumComponentsObtained(marksComponents);
  const maxFromComp = maxTotalFromComponents(compMax);
  const maxTotal = maxFromComp > 0 ? maxFromComp : exSub.maxMarks;

  const rounding = exam.settings?.roundingMode || "NEAREST";
  obtained = applyRounding(obtained, rounding);

  let graceApplied = 0;
  if (exam.settings?.graceMarksEnabled) {
    const g = applyGraceMarks(obtained, maxTotal, true, exam.settings.graceMarksLimit || 0, exSub.passingMarks);
    obtained = g.total;
    graceApplied = g.applied;
  }

  const percentage = computePercentage(obtained, maxTotal, marksComponents, compMax, exSub.weightage);
  const grade = gradeFromPercentage(percentage, exam.gradingScale);
  const passFail = obtained >= exSub.passingMarks ? "PASS" : "FAIL";

  return {
    schoolId: exam.schoolId,
    studentId: entry.studentId,
    examId: exam._id,
    subjectId: exSub.subjectId,
    examSubjectKey: String(exSub.subjectId),
    teacherId,
    subject: subjectName,
    marksComponents,
    marks: obtained,
    totalMarks: maxTotal,
    percentage,
    grade,
    passFail,
    resultStatus,
    remarks: entry.remarks || "",
    rank: null,
  };
};

const saveMarksBulk = async (user, body, ipAddress = "") => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  const { examId, subjectId, classId, section, entries, resultStatus = "DRAFT" } = body;
  if (!examId || !subjectId || !classId || !section || !Array.isArray(entries) || !entries.length) {
    throw new AppError("examId, subjectId, classId, section and entries[] are required", 400);
  }
  assertClass(assignedClassIds, classId);
  await assertTeachesSubject(schoolId, teacher._id, classId, subjectId);

  const exam = await examRepository.findExamByIdSchool({ schoolId, examId });
  if (!exam) throw new AppError("Exam not found", 404);
  if (String(exam.classId?._id || exam.classId) !== String(classId)) throw new AppError("Exam class mismatch", 400);

  const exSub = await examRepository.findExamSubject({ schoolId, examId, subjectId });
  if (!exSub) throw new AppError("Exam subject configuration missing", 404);

  const students = await teacherRepository.findStudentsByClassIds({
    schoolId,
    classIds: [classId],
    section: String(section).trim(),
    search: "",
    skip: 0,
    limit: 5000,
  });
  const allowed = new Set(students.map((s) => String(s._id)));
  const seen = new Set();
  for (const e of entries) {
    const sid = String(e.studentId);
    if (seen.has(sid)) throw new AppError("Duplicate student in entries", 400);
    seen.add(sid);
    if (!allowed.has(sid)) throw new AppError("Student not in selected class/section", 403);
  }

  const st = resultStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  for (const entry of entries) {
    const existing = await examRepository.findResultOne({
      schoolId,
      studentId: entry.studentId,
      examId,
      examSubjectKey: String(subjectId),
    });
    if (existing && !canEditResult(exam, existing)) {
      throw new AppError("Published results are locked for this exam", 403);
    }
    const payloadDoc = buildComputedPayload(exSub, exam, entry, teacher._id, exSub.subjectName, st);
    await examRepository.upsertExamResult({
      filter: {
        schoolId,
        studentId: entry.studentId,
        examId,
        examSubjectKey: String(subjectId),
      },
      payload: { $set: payloadDoc },
    });
  }

  if (st === "PUBLISHED" && exam.settings?.rankEnabled !== false) {
    await recomputeRanks(schoolId, examId, subjectId);
  }

  await teacherRepository.createActivityLog({
    schoolId,
    teacherId: teacher._id,
    action: "MARKS_BULK_SAVE",
    ipAddress,
    meta: { examId, subjectId, count: entries.length, resultStatus: st },
  });

  return { saved: entries.length, resultStatus: st };
};

export const examTeacherService = {
  getMarksTeacher,
  saveMarksBulk,
};

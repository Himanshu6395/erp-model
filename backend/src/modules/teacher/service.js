import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import { teacherRepository } from "./repository.js";
import { noticeRepository } from "../notices/notice.repository.js";
import { MATERIAL_TYPES } from "../../models/StudyMaterial.js";

const ensureTeacherRole = (user) => {
  if (!user?.schoolId) throw new AppError("School context missing", 400);
  if (user.role !== ROLES.TEACHER) throw new AppError("Only TEACHER can access this route", 403);
  return user.schoolId;
};

const todayDayName = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const toDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatStudentLeaveRow = (doc) => {
  const o = doc?.toObject ? doc.toObject() : { ...doc };
  return {
    ...o,
    leaveDisplayId: o._id ? `LV-${String(o._id).slice(-8).toUpperCase()}` : "",
  };
};

const gradeFromPercentage = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

const logActivity = async (user, teacherId, action, ipAddress = "", meta = {}) => {
  await teacherRepository.createActivityLog({
    schoolId: user.schoolId,
    teacherId,
    action,
    ipAddress,
    meta,
  });
};

const getTeacherContext = async (user) => {
  const schoolId = ensureTeacherRole(user);
  const teacher = await teacherRepository.findTeacherByUser({ schoolId, userId: user.userId });
  if (!teacher) throw new AppError("Teacher profile not found", 404);

  const [asClassTeacher, asSubjectTeacher] = await Promise.all([
    teacherRepository.findAssignedClassesByClassTeacher({ schoolId, teacherId: teacher._id }),
    teacherRepository.findAssignedClassesBySubject({ schoolId, teacherId: teacher._id }),
  ]);
  const classIdSet = new Set([
    ...asClassTeacher.map((item) => String(item._id)),
    ...asSubjectTeacher.map((item) => String(item.classId)),
  ]);
  return {
    schoolId,
    teacher,
    assignedClassIds: [...classIdSet],
  };
};

const assertClassAssigned = (assignedClassIds, classId) => {
  if (!assignedClassIds.includes(String(classId))) {
    throw new AppError("You can only access your assigned classes", 403);
  }
};

const getDashboard = async (user) => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  const [
    subjects,
    todayTimetable,
    students,
    assignments,
    upcomingExams,
    announcements,
    activities,
    studentLeaveStats,
    pendingStudentLeavesPreview,
  ] = await Promise.all([
    teacherRepository.findAssignedSubjects({ schoolId, teacherId: teacher._id }),
    teacherRepository.getTodayTimetable({ schoolId, teacherId: teacher._id, day: todayDayName(), academicYear: "2025-2026" }),
    teacherRepository.findStudentsByClassIds({ schoolId, classIds: assignedClassIds, skip: 0, limit: 5000 }),
    teacherRepository.findAssignments({ schoolId, classIds: assignedClassIds, teacherId: teacher._id }),
    teacherRepository.findUpcomingExams({ schoolId, classIds: assignedClassIds, now: new Date() }),
    noticeRepository.findPublishedForTeacher({ schoolId }),
    teacherRepository.listActivityLogs({ schoolId, teacherId: teacher._id }),
    teacherRepository.aggregateStudentLeaveStats({ schoolId, classTeacherId: teacher._id }),
    teacherRepository.findStudentLeavesForClassTeacher({
      schoolId,
      classTeacherId: teacher._id,
      filter: { status: "PENDING" },
      limit: 6,
    }),
  ]);

  const { start, end } = getMonthRange();
  const monthAttendance = await teacherRepository.findAttendanceByQuery({
    schoolId,
    classIds: assignedClassIds,
    from: start,
    to: end,
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  const todayAttendance = monthAttendance.filter((item) => item.date >= today && item.date <= todayEnd);
  const pendingHomework = assignments.filter((item) => new Date(item.dueDate) >= new Date()).length;

  return {
    profile: {
      name: teacher.userId?.name || "",
      image: teacher.profileImage || "",
      email: teacher.userId?.email || "",
    },
    assignedClasses: assignedClassIds.length,
    assignedSubjects: subjects,
    todayTimetable,
    totalStudents: students.length,
    pendingHomeworkCount: pendingHomework,
    attendanceSummary: {
      todayCount: todayAttendance.length,
      monthlyCount: monthAttendance.length,
    },
    upcomingExams,
    recentAnnouncements: announcements.slice(0, 8),
    recentActivities: activities.slice(0, 12),
    studentLeaveStats,
    pendingStudentLeaves: (pendingStudentLeavesPreview || []).map(formatStudentLeaveRow),
  };
};

const listAssignedStudents = async (user, query) => {
  const { schoolId, assignedClassIds } = await getTeacherContext(user);
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const skip = (page - 1) * limit;
  const section = query.section || "";
  const classId = query.classId || "";
  let scopedClassIds = assignedClassIds;
  if (classId) {
    assertClassAssigned(assignedClassIds, classId);
    scopedClassIds = [String(classId)];
  }
  const [items, total] = await Promise.all([
    teacherRepository.findStudentsByClassIds({ schoolId, classIds: scopedClassIds, search: query.search || "", section, skip, limit }),
    teacherRepository.countStudentsByClassIds({ schoolId, classIds: scopedClassIds, section }),
  ]);
  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getStudentProfile = async (user, studentId) => {
  const { schoolId, assignedClassIds } = await getTeacherContext(user);
  const student = await teacherRepository.findStudentById({ schoolId, studentId });
  if (!student) throw new AppError("Student not found", 404);
  assertClassAssigned(assignedClassIds, student.classId?._id || student.classId);
  const [attendance, results] = await Promise.all([
    teacherRepository.findAttendanceByStudent({ schoolId, studentId }),
    teacherRepository.findResultsByStudent({ schoolId, studentId }),
  ]);
  const presentCount = attendance.filter((item) => item.status === "PRESENT").length;
  const attendancePercentage = attendance.length ? Number(((presentCount / attendance.length) * 100).toFixed(2)) : 0;
  const avgMarks = results.length ? Number((results.reduce((sum, item) => sum + item.marks, 0) / results.length).toFixed(2)) : 0;
  return {
    ...student.toObject(),
    attendanceSummary: { total: attendance.length, present: presentCount, percentage: attendancePercentage },
    performanceSummary: { examsCount: results.length, averageMarks: avgMarks },
  };
};

const markAttendance = async (user, payload, ipAddress = "") => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  const attendanceDate = toDate(payload.date);
  if (!attendanceDate) throw new AppError("Invalid attendance date", 400);
  const now = new Date();
  if (attendanceDate > now) throw new AppError("Future date attendance is not allowed", 400);
  const student = await teacherRepository.findStudentById({ schoolId, studentId: payload.studentId });
  if (!student) throw new AppError("Student not found", 404);
  assertClassAssigned(assignedClassIds, student.classId?._id || student.classId);
  const normalizedDate = new Date(attendanceDate);
  normalizedDate.setHours(0, 0, 0, 0);
  const data = await teacherRepository.upsertAttendance({
    schoolId,
    studentId: payload.studentId,
    date: normalizedDate,
    payload: {
      status: payload.status,
      remark: payload.remark || "",
      markedBy: teacher._id,
    },
  });
  await logActivity(user, teacher._id, "ATTENDANCE_MARKED", ipAddress, { studentId: payload.studentId, date: normalizedDate });
  return data;
};

const bulkMarkAttendance = async (user, payload, ipAddress = "") => {
  const results = [];
  for (const entry of payload.entries || []) {
    const marked = await markAttendance(user, entry, ipAddress);
    results.push(marked);
  }
  return { markedCount: results.length, items: results };
};

const ATT_STATUSES = new Set(["PRESENT", "ABSENT", "LEAVE", "LATE"]);

const startEndOfLocalDay = (d) => {
  const day = new Date(d);
  if (Number.isNaN(day.getTime())) return null;
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
  return { start, end };
};

/** Students + saved status for one calendar day (null status = not saved yet; UI defaults Present). */
const getDailyAttendanceRoster = async (user, query) => {
  const { schoolId, assignedClassIds } = await getTeacherContext(user);
  assertClassAssigned(assignedClassIds, query.classId);
  const section = String(query.section || "").trim();
  if (!section) throw new AppError("Section is required", 400);
  const dateInput = query.date ? toDate(query.date) : new Date();
  if (!dateInput) throw new AppError("Invalid date", 400);
  const now = new Date();
  if (dateInput > now) throw new AppError("Future date attendance is not allowed", 400);
  const bounds = startEndOfLocalDay(dateInput);
  if (!bounds) throw new AppError("Invalid date", 400);

  const students = await teacherRepository.findStudentsByClassIds({
    schoolId,
    classIds: [query.classId],
    section,
    search: "",
    skip: 0,
    limit: 5000,
  });
  const studentIds = students.map((s) => s._id);
  const rows = await teacherRepository.findAttendanceForStudentsOnDate({
    schoolId,
    studentIds,
    dayStart: bounds.start,
    dayEnd: bounds.end,
  });
  const statusByStudent = new Map(rows.map((r) => [String(r.studentId), r.status]));

  const roster = students.map((stu) => ({
    studentId: stu._id,
    rollNumber: stu.rollNumber || "",
    name: stu.userId?.name || "",
    status: statusByStudent.get(String(stu._id)) || null,
  }));

  const ds = bounds.start;
  const dateStr = `${ds.getFullYear()}-${String(ds.getMonth() + 1).padStart(2, "0")}-${String(ds.getDate()).padStart(2, "0")}`;

  return {
    date: dateStr,
    classId: query.classId,
    section,
    students: roster,
  };
};

/** Save many rows for one class/section/day; validates roster membership and no duplicate studentIds in payload. */
const saveDailyAttendanceBatch = async (user, payload, ipAddress = "") => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  assertClassAssigned(assignedClassIds, payload.classId);
  const section = String(payload.section || "").trim();
  if (!section) throw new AppError("Section is required", 400);
  const entries = payload.entries || [];
  if (!entries.length) throw new AppError("At least one attendance entry is required", 400);

  const seen = new Set();
  for (const e of entries) {
    const sid = String(e.studentId);
    if (seen.has(sid)) throw new AppError(`Duplicate studentId in request: ${sid}`, 400);
    seen.add(sid);
    if (!ATT_STATUSES.has(e.status)) throw new AppError("Invalid status", 400);
  }

  const dateSrc = payload.date ? toDate(payload.date) : new Date();
  if (!dateSrc) throw new AppError("Invalid date", 400);
  const now = new Date();
  if (dateSrc > now) throw new AppError("Future date attendance is not allowed", 400);
  const bounds = startEndOfLocalDay(dateSrc);
  if (!bounds) throw new AppError("Invalid date", 400);
  const normalizedDate = bounds.start;

  const rosterStudents = await teacherRepository.findStudentsByClassIds({
    schoolId,
    classIds: [payload.classId],
    section,
    search: "",
    skip: 0,
    limit: 5000,
  });
  const allowed = new Set(rosterStudents.map((s) => String(s._id)));
  for (const e of entries) {
    if (!allowed.has(String(e.studentId))) {
      throw new AppError("One or more students are not in the selected class and section", 403);
    }
  }

  const results = await Promise.all(
    entries.map((e) =>
      teacherRepository.upsertAttendance({
        schoolId,
        studentId: e.studentId,
        date: normalizedDate,
        payload: {
          status: e.status,
          remark: e.remark || "",
          markedBy: teacher._id,
        },
      })
    )
  );

  await logActivity(user, teacher._id, "DAILY_ATTENDANCE_BATCH", ipAddress, {
    classId: payload.classId,
    section,
    date: normalizedDate,
    count: results.length,
  });

  const nd = normalizedDate;
  const dateStr = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}-${String(nd.getDate()).padStart(2, "0")}`;
  return { saved: results.length, date: dateStr };
};

const attendanceReports = async (user, query) => {
  const { schoolId, assignedClassIds } = await getTeacherContext(user);
  const from = toDate(query.from) || new Date("2000-01-01");
  const to = toDate(query.to) || new Date("2999-12-31");
  const items = await teacherRepository.findAttendanceByQuery({ schoolId, classIds: assignedClassIds, from, to });
  const validItems = items.filter((item) => item.studentId);
  const classWise = {};
  validItems.forEach((item) => {
    const classKey = `${item.studentId.classId?.name || ""}-${item.studentId.section || ""}`;
    if (!classWise[classKey]) classWise[classKey] = { total: 0, present: 0, absent: 0, leave: 0, late: 0 };
    classWise[classKey].total += 1;
    if (item.status === "PRESENT") classWise[classKey].present += 1;
    if (item.status === "ABSENT") classWise[classKey].absent += 1;
    if (item.status === "LEAVE") classWise[classKey].leave += 1;
    if (item.status === "LATE") classWise[classKey].late += 1;
  });
  return {
    daily: validItems.filter((item) => item.date.toISOString().slice(0, 10) === (query.day || "")),
    monthly: validItems,
    classWise,
  };
};

const attendanceStatusToApi = (status) => {
  const m = { PRESENT: "present", ABSENT: "absent", LEAVE: "leave", LATE: "late" };
  return m[status] || null;
};

const parseYearMonth = (monthStr) => {
  const parts = String(monthStr || "").split("-");
  const y = Number(parts[0]);
  const mo = Number(parts[1]);
  if (!y || !mo || mo < 1 || mo > 12) return null;
  const start = new Date(y, mo - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, mo, 0, 23, 59, 59, 999);
  const daysInMonth = new Date(y, mo, 0).getDate();
  return { year: y, month: mo, start, end, daysInMonth };
};

const getMonthlyAttendanceGrid = async (user, query) => {
  const { schoolId, assignedClassIds } = await getTeacherContext(user);
  assertClassAssigned(assignedClassIds, query.classId);
  const parsed = parseYearMonth(query.month);
  if (!parsed) throw new AppError("Invalid month (use YYYY-MM)", 400);
  const section = String(query.section || "").trim();
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 50)));
  const skip = (page - 1) * limit;
  const classId = query.classId;

  const [totalStudents, studentsPage, idRows] = await Promise.all([
    teacherRepository.countStudentsByClassIds({ schoolId, classIds: [classId], section }),
    teacherRepository.findStudentsByClassIds({ schoolId, classIds: [classId], section, search: "", skip, limit }),
    teacherRepository.findStudentIdsByClassSection({ schoolId, classId, section }),
  ]);

  const pageStudentIds = studentsPage.map((s) => s._id);
  const allStudentIds = idRows.map((r) => r._id);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [monthRows, todayRows] = await Promise.all([
    teacherRepository.findAttendanceByStudentIdsDateRange({
      schoolId,
      studentIds: pageStudentIds,
      from: parsed.start,
      to: parsed.end,
    }),
    teacherRepository.findAttendanceByStudentIdsDateRange({
      schoolId,
      studentIds: allStudentIds,
      from: todayStart,
      to: todayEnd,
    }),
  ]);

  const byStudent = new Map();
  for (const row of monthRows) {
    const sid = String(row.studentId);
    const day = new Date(row.date).getDate();
    if (!byStudent.has(sid)) byStudent.set(sid, new Map());
    byStudent.get(sid).set(day, attendanceStatusToApi(row.status));
  }

  const gridRows = studentsPage.map((stu) => {
    const sid = String(stu._id);
    const amap = byStudent.get(sid) || new Map();
    const attendance = {};
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let lateCount = 0;
    for (let d = 1; d <= parsed.daysInMonth; d++) {
      const v = amap.get(d);
      if (v) {
        attendance[String(d)] = v;
        if (v === "present") presentCount += 1;
        else if (v === "absent") absentCount += 1;
        else if (v === "leave") leaveCount += 1;
        else if (v === "late") lateCount += 1;
      }
    }
    const totalMarked = presentCount + absentCount + leaveCount + lateCount;
    const percentage = totalMarked ? Math.round((100 * presentCount) / totalMarked) : 0;
    return {
      studentId: stu._id,
      rollNumber: stu.rollNumber || "",
      name: stu.userId?.name || "",
      attendance,
      totalDays: totalMarked,
      presentCount,
      absentCount,
      leaveCount,
      lateCount,
      percentage,
    };
  });

  let presentToday = 0;
  let absentToday = 0;
  let leaveToday = 0;
  let lateToday = 0;
  for (const row of todayRows) {
    if (row.status === "PRESENT") presentToday += 1;
    else if (row.status === "ABSENT") absentToday += 1;
    else if (row.status === "LEAVE") leaveToday += 1;
    else if (row.status === "LATE") lateToday += 1;
  }
  const totalClassStudents = allStudentIds.length;
  const attendancePercentToday = totalClassStudents ? Math.round((100 * presentToday) / totalClassStudents) : 0;

  return {
    year: parsed.year,
    month: parsed.month,
    monthLabel: `${parsed.year}-${String(parsed.month).padStart(2, "0")}`,
    daysInMonth: parsed.daysInMonth,
    summary: {
      totalStudents: totalClassStudents,
      presentToday,
      absentToday,
      leaveToday,
      lateToday,
      attendancePercentToday,
    },
    rows: gridRows,
    page,
    limit,
    totalStudents,
    totalPages: Math.max(1, Math.ceil(totalStudents / limit)),
  };
};

const homeworkClassOption = (cls) => {
  if (!cls || !cls._id) return null;
  const section = String(cls.section ?? "").trim();
  const name = String(cls.name ?? "").trim();
  return {
    classId: cls._id,
    section,
    name,
    label: section ? `${name} — Section ${section}` : name || "Class",
  };
};

/** Classes this teacher may post homework for: class-teacher classes first, else subject-assigned classes. */
const getHomeworkClassOptions = async (user) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const asCT = await teacherRepository.findAssignedClassesByClassTeacher({ schoolId, teacherId: teacher._id });
  const fromCT = asCT.map(homeworkClassOption).filter(Boolean);
  if (fromCT.length) return fromCT;

  const subs = await teacherRepository.findAssignedSubjects({ schoolId, teacherId: teacher._id });
  const map = new Map();
  for (const s of subs) {
    const cls = s.classId;
    const opt = homeworkClassOption(cls);
    if (opt && !map.has(String(opt.classId))) map.set(String(opt.classId), opt);
  }
  return [...map.values()];
};

const resolveHomeworkTargetClass = async (user, requestedClassId) => {
  const options = await getHomeworkClassOptions(user);
  if (!options.length) {
    throw new AppError("No class is mapped to your profile. Ask the school admin to assign you as class teacher or assign subjects.", 403);
  }
  if (options.length === 1) {
    return options[0];
  }
  if (!requestedClassId) {
    throw new AppError("Select which class this homework is for", 400);
  }
  const found = options.find((o) => String(o.classId) === String(requestedClassId));
  if (!found) throw new AppError("That class is not mapped to your profile", 403);
  return found;
};

const getHomeworkScope = async (user) => {
  const options = await getHomeworkClassOptions(user);
  return {
    options,
    requiresClassPick: options.length > 1,
  };
};

const createHomework = async (user, payload, ipAddress = "") => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const target = await resolveHomeworkTargetClass(user, payload.classId);
  const clsRow = await teacherRepository.findClassByIdSchool({ schoolId, classId: target.classId });
  if (!clsRow) throw new AppError("Class not found", 404);
  const section = String(clsRow.section ?? "").trim();

  const assignment = await teacherRepository.createAssignment({
    schoolId,
    classId: clsRow._id,
    section,
    title: payload.title,
    description: payload.description || "",
    subject: payload.subject || "",
    attachments: payload.attachments || [],
    createdBy: teacher._id,
    dueDate: new Date(payload.dueDate),
  });
  await logActivity(user, teacher._id, "HOMEWORK_CREATED", ipAddress, { assignmentId: assignment._id });
  return assignment;
};

const updateHomework = async (user, assignmentId, payload, ipAddress = "") => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const { classId: _c, section: _s, ...rest } = payload || {};
  const updated = await teacherRepository.updateAssignment({
    schoolId,
    assignmentId,
    teacherId: teacher._id,
    payload: {
      ...rest,
      ...(rest.dueDate ? { dueDate: new Date(rest.dueDate) } : {}),
    },
  });
  if (!updated) throw new AppError("Homework not found or not owned by this teacher", 404);
  await logActivity(user, teacher._id, "HOMEWORK_UPDATED", ipAddress, { assignmentId });
  return updated;
};

const deleteHomework = async (user, assignmentId, ipAddress = "") => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const deleted = await teacherRepository.deleteAssignment({ schoolId, assignmentId, teacherId: teacher._id });
  if (!deleted) throw new AppError("Homework not found or not owned by this teacher", 404);
  await logActivity(user, teacher._id, "HOMEWORK_DELETED", ipAddress, { assignmentId });
  return { deleted: true };
};

const listHomework = async (user) => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  const assignments = await teacherRepository.findAssignments({ schoolId, classIds: assignedClassIds, teacherId: teacher._id });
  const submissions = await teacherRepository.findSubmissionsByAssignmentIds({
    schoolId,
    assignmentIds: assignments.map((item) => item._id),
  });
  const submissionMap = submissions.reduce((acc, item) => {
    const key = String(item.assignmentId);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  return assignments.map((item) => {
    const rows = submissionMap[String(item._id)] || [];
    return {
      ...item.toObject(),
      submissionCount: rows.length,
      lateSubmissionCount: rows.filter((row) => row.isLate).length,
      submissions: rows,
    };
  });
};

const createExam = async (user, payload) => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  assertClassAssigned(assignedClassIds, payload.classId);
  return teacherRepository.createExam({
    schoolId,
    classId: payload.classId,
    section: payload.section || "",
    title: payload.title,
    examDate: new Date(payload.examDate),
    createdBy: teacher._id,
  });
};

const listExams = async (user) => {
  const { schoolId, assignedClassIds } = await getTeacherContext(user);
  return teacherRepository.findExams({ schoolId, classIds: assignedClassIds });
};

const upsertMarks = async (user, payload, ipAddress = "") => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  const student = await teacherRepository.findStudentById({ schoolId, studentId: payload.studentId });
  if (!student) throw new AppError("Student not found", 404);
  assertClassAssigned(assignedClassIds, student.classId?._id || student.classId);
  const totalMarks = Number(payload.totalMarks || 100);
  const marksObtained = Number(payload.marksObtained || payload.marks || 0);
  const percentage = totalMarks > 0 ? Number(((marksObtained / totalMarks) * 100).toFixed(2)) : 0;
  const grade = payload.grade || gradeFromPercentage(percentage);
  const result = await teacherRepository.upsertResult({
    schoolId,
    studentId: payload.studentId,
    examId: payload.examId,
    subject: payload.subject,
    payload: {
      teacherId: teacher._id,
      subject: payload.subject,
      marks: marksObtained,
      totalMarks,
      percentage,
      grade,
      remarks: payload.remarks || "",
    },
  });
  await logActivity(user, teacher._id, "MARKS_UPSERT", ipAddress, { resultId: result._id });
  return result;
};

const getStudentResults = async (user, studentId) => {
  const { schoolId, assignedClassIds } = await getTeacherContext(user);
  const student = await teacherRepository.findStudentById({ schoolId, studentId });
  if (!student) throw new AppError("Student not found", 404);
  assertClassAssigned(assignedClassIds, student.classId?._id || student.classId);
  return teacherRepository.findResultsByStudent({ schoolId, studentId });
};

const getTimetable = async (user, query = {}) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const academicYear = query.academicYear || "2025-2026";
  const rows = await teacherRepository.getTimetable({ schoolId, teacherId: teacher._id, academicYear });
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return rows.map((row) => ({
    ...row.toObject(),
    periodNumber: row.periodNumber ?? row.period,
    isCurrentClass: row.day === todayDayName() && hhmm >= row.startTime && hhmm <= row.endTime,
  }));
};

const getTodayTimetable = async (user, query = {}) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const academicYear = query.academicYear || "2025-2026";
  return teacherRepository.getTodayTimetable({ schoolId, teacherId: teacher._id, day: todayDayName(), academicYear });
};

const sendCommunication = async (user, payload, ipAddress = "") => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const data = await teacherRepository.createCommunication({
    schoolId,
    teacherId: teacher._id,
    title: payload.title,
    message: payload.message,
    receiverType: payload.receiverType,
    receiverIds: payload.receiverIds || [],
    channels: payload.channels || ["EMAIL"],
    sentAt: new Date(),
  });
  await logActivity(user, teacher._id, "COMMUNICATION_SENT", ipAddress, { communicationId: data._id });
  return data;
};

const communicationHistory = async (user) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  return teacherRepository.getCommunications({ schoolId, teacherId: teacher._id });
};

const listTeacherNotices = async (user) => {
  const schoolId = ensureTeacherRole(user);
  return noticeRepository.findPublishedForTeacher({ schoolId });
};

/** @deprecated use listTeacherNotices — read-only school notices */
const listAnnouncements = listTeacherNotices;

const materialTypeSet = new Set(MATERIAL_TYPES);

const parseRestrictedIds = (raw) => {
  try {
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === "string") return JSON.parse(raw || "[]");
  } catch {
    /* ignore */
  }
  return [];
};

const assertSubjectForClass = async (schoolId, classId, subjectId, subjectFallback) => {
  if (subjectId) {
    const sub = await teacherRepository.findSubjectInClass({ schoolId, subjectId, classId });
    if (!sub) throw new AppError("Subject not found for this class", 400);
    return;
  }
  if (!String(subjectFallback || "").trim()) throw new AppError("Subject (subjectId or subject name) is required", 400);
};

const buildCreatePayload = async (user, body, files) => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  assertClassAssigned(assignedClassIds, body.classId);

  const file = files?.file?.[0];
  const thumb = files?.thumbnail?.[0];
  const fileUrl = file ? `/uploads/study-materials/${file.filename}` : String(body.fileUrl || "").trim();
  const thumbnail = thumb ? `/uploads/study-materials/${thumb.filename}` : String(body.thumbnail || "").trim();
  const externalLink = String(body.externalLink || "").trim();
  const subjectId = body.subjectId && String(body.subjectId).trim() ? body.subjectId : null;

  await assertSubjectForClass(schoolId, body.classId, subjectId, body.subject);

  const materialType = materialTypeSet.has(body.materialType) ? body.materialType : "NOTES";
  const visibility = body.visibility === "RESTRICTED" ? "RESTRICTED" : "PUBLIC";
  const restrictedStudentIds = parseRestrictedIds(body.restrictedStudentIds);

  if (!fileUrl && !externalLink) throw new AppError("Upload a file or provide an external link", 400);

  return {
    schoolId,
    teacherId: teacher._id,
    classId: body.classId,
    section: String(body.section ?? "A").trim() || "A",
    subjectId,
    subject: String(body.subject || "").trim(),
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    topic: String(body.topic || "").trim(),
    materialType,
    fileUrl,
    externalLink,
    thumbnail,
    publishDate: body.publishDate ? new Date(body.publishDate) : new Date(),
    expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
    visibility,
    restrictedStudentIds,
    allowDownload: !(body.allowDownload === false || body.allowDownload === "false"),
    allowComments: body.allowComments === true || body.allowComments === "true",
    priority: ["LOW", "MEDIUM", "HIGH"].includes(body.priority) ? body.priority : "MEDIUM",
    status: body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
  };
};

/** Legacy JSON body (no multipart) — e.g. POST /teacher/study-material */
const createStudyMaterial = async (user, body) => {
  const payload = await buildCreatePayload(user, body, null);
  const row = await teacherRepository.createStudyMaterial(payload);
  await logActivity(user, payload.teacherId, "STUDY_MATERIAL_CREATED", "", { materialId: row._id });
  return teacherRepository.findStudyMaterialByTeacher({
    schoolId: payload.schoolId,
    teacherId: payload.teacherId,
    materialId: row._id,
  });
};

const createStudyMaterialMultipart = async (user, body, files) => {
  const payload = await buildCreatePayload(user, body, files);
  const row = await teacherRepository.createStudyMaterial(payload);
  await logActivity(user, payload.teacherId, "STUDY_MATERIAL_CREATED", "", { materialId: row._id });
  return teacherRepository.findStudyMaterialByTeacher({
    schoolId: payload.schoolId,
    teacherId: payload.teacherId,
    materialId: row._id,
  });
};

const listStudyMaterialsTeacher = async (user, query) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  return teacherRepository.getStudyMaterialsFiltered({
    schoolId,
    teacherId: teacher._id,
    classId: query.classId || undefined,
    section: query.section || undefined,
    subjectId: query.subjectId || undefined,
    materialType: query.materialType || undefined,
    from: query.from || undefined,
    to: query.to || undefined,
  });
};

const listStudyMaterial = async (user) => listStudyMaterialsTeacher(user, {});

const updateStudyMaterial = async (user, materialId, body, files) => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  const existing = await teacherRepository.findStudyMaterialByTeacher({ schoolId, teacherId: teacher._id, materialId });
  if (!existing) throw new AppError("Study material not found", 404);
  assertClassAssigned(assignedClassIds, String(existing.classId._id || existing.classId));

  const nextClassId = body.classId || existing.classId._id || existing.classId;
  assertClassAssigned(assignedClassIds, String(nextClassId));

  const file = files?.file?.[0];
  const thumb = files?.thumbnail?.[0];
  let fileUrl = existing.fileUrl;
  if (file) fileUrl = `/uploads/study-materials/${file.filename}`;
  else if (body.fileUrl !== undefined) fileUrl = String(body.fileUrl || "").trim();

  let thumbnail = existing.thumbnail;
  if (thumb) thumbnail = `/uploads/study-materials/${thumb.filename}`;
  else if (body.thumbnail !== undefined) thumbnail = String(body.thumbnail || "").trim();

  const externalLink = body.externalLink !== undefined ? String(body.externalLink || "").trim() : existing.externalLink;
  const existingSubjectId = existing.subjectId?._id || existing.subjectId;
  const subjectId =
    body.subjectId !== undefined
      ? body.subjectId && String(body.subjectId).trim()
        ? body.subjectId
        : null
      : existingSubjectId;

  await assertSubjectForClass(schoolId, nextClassId, subjectId, body.subject !== undefined ? body.subject : existing.subject);

  const merged = {
    classId: nextClassId,
    section: body.section !== undefined ? String(body.section).trim() : existing.section,
    subjectId,
    subject: body.subject !== undefined ? String(body.subject || "").trim() : existing.subject,
    title: body.title !== undefined ? String(body.title || "").trim() : existing.title,
    description: body.description !== undefined ? String(body.description || "").trim() : existing.description,
    topic: body.topic !== undefined ? String(body.topic || "").trim() : existing.topic,
    materialType: body.materialType && materialTypeSet.has(body.materialType) ? body.materialType : existing.materialType,
    fileUrl,
    externalLink,
    thumbnail,
    publishDate: body.publishDate ? new Date(body.publishDate) : existing.publishDate,
    expiryDate: body.expiryDate !== undefined ? (body.expiryDate ? new Date(body.expiryDate) : null) : existing.expiryDate,
    visibility: body.visibility === "RESTRICTED" ? "RESTRICTED" : body.visibility === "PUBLIC" ? "PUBLIC" : existing.visibility,
    restrictedStudentIds:
      body.restrictedStudentIds !== undefined ? parseRestrictedIds(body.restrictedStudentIds) : existing.restrictedStudentIds,
    allowDownload:
      body.allowDownload !== undefined ? !(body.allowDownload === false || body.allowDownload === "false") : existing.allowDownload,
    allowComments:
      body.allowComments !== undefined ? body.allowComments === true || body.allowComments === "true" : existing.allowComments,
    priority: body.priority && ["LOW", "MEDIUM", "HIGH"].includes(body.priority) ? body.priority : existing.priority,
    status: body.status === "PUBLISHED" || body.status === "DRAFT" ? body.status : existing.status,
  };

  if (!merged.fileUrl && !merged.externalLink) throw new AppError("fileUrl or external link required", 400);

  const updated = await teacherRepository.updateStudyMaterialByTeacher({
    schoolId,
    teacherId: teacher._id,
    materialId,
    payload: merged,
  });
  await logActivity(user, teacher._id, "STUDY_MATERIAL_UPDATED", "", { materialId });
  return updated;
};

const deleteStudyMaterial = async (user, materialId) => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  const existing = await teacherRepository.findStudyMaterialByTeacher({ schoolId, teacherId: teacher._id, materialId });
  if (!existing) throw new AppError("Study material not found", 404);
  assertClassAssigned(assignedClassIds, String(existing.classId._id || existing.classId));
  await teacherRepository.deleteStudyMaterialByTeacher({ schoolId, teacherId: teacher._id, materialId });
  await logActivity(user, teacher._id, "STUDY_MATERIAL_DELETED", "", { materialId });
  return { deleted: true };
};

/** Classes the teacher may teach (class teacher + subject assignments) with subjects per class */
const listAssignedClassesWithSubjects = async (user) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const [asClassTeacher, subs] = await Promise.all([
    teacherRepository.findAssignedClassesByClassTeacher({ schoolId, teacherId: teacher._id }),
    teacherRepository.findAssignedSubjects({ schoolId, teacherId: teacher._id }),
  ]);
  const byClass = new Map();
  for (const cls of asClassTeacher) {
    const cid = String(cls._id);
    const section = String(cls.section ?? "").trim();
    const name = cls.name || "";
    byClass.set(cid, {
      classId: cid,
      className: name,
      section,
      label: section ? `${name} — Section ${section}` : name,
      subjects: [],
    });
  }
  for (const s of subs) {
    const cid = String(s.classId?._id || s.classId);
    const c = s.classId;
    if (!byClass.has(cid)) {
      const section = String(c?.section ?? "").trim();
      const name = c?.name || "";
      byClass.set(cid, {
        classId: cid,
        className: name,
        section,
        label: section ? `${name} — Section ${section}` : name,
        subjects: [],
      });
    }
    byClass.get(cid).subjects.push({ _id: s._id, name: s.name });
  }
  return [...byClass.values()];
};

const studentPerformanceInsights = async (user) => {
  const studentsPage = await listAssignedStudents(user, { page: 1, limit: 5000 });
  const weakStudents = [];
  for (const student of studentsPage.items) {
    const [attendanceRows, results] = await Promise.all([
      teacherRepository.findAttendanceByStudent({ schoolId: user.schoolId, studentId: student._id }),
      teacherRepository.findResultsByStudent({ schoolId: user.schoolId, studentId: student._id }),
    ]);
    const present = attendanceRows.filter((item) => item.status === "PRESENT").length;
    const attendancePct = attendanceRows.length ? (present / attendanceRows.length) * 100 : 0;
    const avgMarks = results.length ? results.reduce((sum, item) => sum + item.marks, 0) / results.length : 0;
    if (attendancePct < 75 || avgMarks < 40) {
      weakStudents.push({
        studentId: student._id,
        name: student.userId?.name || "",
        attendancePercentage: Number(attendancePct.toFixed(2)),
        averageMarks: Number(avgMarks.toFixed(2)),
        insight:
          attendancePct < 75 && avgMarks < 40
            ? "Low attendance and low marks"
            : attendancePct < 75
              ? "Low attendance"
              : "Low marks",
      });
    }
  }
  return {
    totalStudents: studentsPage.items.length,
    weakStudents,
    aiInsight: "Students listed here need targeted intervention plans based on attendance and marks trends.",
  };
};

const applyLeave = async (user, payload) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  return teacherRepository.createLeave({
    schoolId,
    teacherId: teacher._id,
    leaveType: payload.leaveType,
    startDate: new Date(payload.startDate),
    endDate: new Date(payload.endDate),
    reason: payload.reason || "",
    status: "PENDING",
  });
};

const cancelLeave = async (user, leaveId) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const updated = await teacherRepository.cancelLeave({ schoolId, teacherId: teacher._id, leaveId });
  if (!updated) throw new AppError("Leave request not found", 404);
  return updated;
};

const listLeaves = async (user) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  return teacherRepository.listLeaves({ schoolId, teacherId: teacher._id });
};

const listStudentLeavesForClassTeacher = async (user, query) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const filter = {};
  if (query.status && ["PENDING", "APPROVED", "REJECTED"].includes(String(query.status))) {
    filter.status = query.status;
  }
  if (query.from || query.to) {
    const fromD = query.from ? new Date(query.from) : new Date("1970-01-01");
    const toD = query.to ? new Date(query.to) : new Date("9999-12-31");
    fromD.setHours(0, 0, 0, 0);
    toD.setHours(23, 59, 59, 999);
    filter.fromDate = { $lte: toD };
    filter.toDate = { $gte: fromD };
  }
  if (query.search?.trim()) {
    const ids = await teacherRepository.findStudentIdsMatchingName({ schoolId, search: query.search });
    if (!ids.length) return [];
    filter.studentId = { $in: ids };
  }
  const rows = await teacherRepository.findStudentLeavesForClassTeacher({
    schoolId,
    classTeacherId: teacher._id,
    filter,
  });
  return rows.map(formatStudentLeaveRow);
};

const getStudentLeaveStatsForClassTeacher = async (user) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  return teacherRepository.aggregateStudentLeaveStats({ schoolId, classTeacherId: teacher._id });
};

const decideStudentLeave = async (user, leaveId, payload, ipAddress = "") => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const decision = String(payload.decision || "").toUpperCase();
  if (!["APPROVE", "REJECT"].includes(decision)) throw new AppError("decision must be APPROVE or REJECT", 400);

  const leave = await teacherRepository.findStudentLeaveByIdForClassTeacher({
    schoolId,
    leaveId,
    classTeacherId: teacher._id,
  });
  if (!leave) throw new AppError("Leave request not found", 404);
  if (leave.status !== "PENDING") throw new AppError("This leave request is already closed", 400);

  const remarks = String(payload.teacherRemarks || "").trim();
  if (decision === "REJECT" && !remarks) throw new AppError("Remarks are required when rejecting a leave", 400);

  const status = decision === "APPROVE" ? "APPROVED" : "REJECTED";
  const updated = await teacherRepository.updateStudentLeaveForClassTeacher({
    schoolId,
    leaveId,
    classTeacherId: teacher._id,
    payload: {
      status,
      teacherRemarks: remarks,
      reviewedAt: new Date(),
    },
  });

  const studentDoc = await teacherRepository.findStudentById({ schoolId, studentId: leave.studentId?._id || leave.studentId });
  const studentUserId = studentDoc?.userId?._id || studentDoc?.userId;
  if (studentUserId) {
    const fromStr = new Date(leave.fromDate).toLocaleDateString();
    const toStr = new Date(leave.toDate).toLocaleDateString();
    await teacherRepository.createNotification({
      schoolId,
      userId: studentUserId,
      title: status === "APPROVED" ? "Leave approved" : "Leave rejected",
      message:
        status === "APPROVED"
          ? `Your ${leave.leaveType} leave from ${fromStr} to ${toStr} was approved.${remarks ? ` Remarks: ${remarks}` : ""}`
          : `Your ${leave.leaveType} leave from ${fromStr} to ${toStr} was rejected. Remarks: ${remarks}`,
      type: "LEAVE_STATUS",
    });
  }

  await logActivity(user, teacher._id, `STUDENT_LEAVE_${status}`, ipAddress, { leaveId });
  return formatStudentLeaveRow(updated);
};

const createDiary = async (user, payload) => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  assertClassAssigned(assignedClassIds, payload.classId);
  return teacherRepository.createDiary({
    schoolId,
    teacherId: teacher._id,
    classId: payload.classId,
    subject: payload.subject,
    date: new Date(payload.date),
    notes: payload.notes,
  });
};

const listDiary = async (user) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  return teacherRepository.listDiaries({ schoolId, teacherId: teacher._id });
};

const scheduleOnlineClass = async (user, payload) => {
  const { schoolId, teacher, assignedClassIds } = await getTeacherContext(user);
  assertClassAssigned(assignedClassIds, payload.classId);
  return teacherRepository.createOnlineClass({
    schoolId,
    teacherId: teacher._id,
    classId: payload.classId,
    subject: payload.subject,
    date: new Date(payload.date),
    meetingLink: payload.meetingLink,
  });
};

const listOnlineClasses = async (user) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  return teacherRepository.listOnlineClasses({ schoolId, teacherId: teacher._id });
};

const listDoubts = async (user) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  return teacherRepository.listDoubts({ schoolId, teacherId: teacher._id });
};

const answerDoubt = async (user, doubtId, answer) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  const updated = await teacherRepository.answerDoubt({ schoolId, teacherId: teacher._id, doubtId, answer });
  if (!updated) throw new AppError("Doubt not found", 404);
  return updated;
};

const listNotifications = async (user) => {
  const { schoolId } = await getTeacherContext(user);
  return teacherRepository.listNotifications({ schoolId, userId: user.userId });
};

const markNotificationRead = async (user, notificationId) => {
  const { schoolId } = await getTeacherContext(user);
  const updated = await teacherRepository.markNotificationRead({ schoolId, userId: user.userId, notificationId });
  if (!updated) throw new AppError("Notification not found", 404);
  return updated;
};

const updateProfile = async (user, payload) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  await teacherRepository.updateUserById({
    userId: teacher.userId?._id || user.userId,
    payload: {
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.email ? { email: payload.email } : {}),
      ...(payload.phone ? { phone: payload.phone } : {}),
    },
  });
  const updatedTeacher = await teacherRepository.updateTeacherById({
    schoolId,
    teacherId: teacher._id,
    payload: {
      ...(payload.phone ? { phone: payload.phone } : {}),
      ...(payload.profileImage ? { profileImage: payload.profileImage } : {}),
    },
  });
  return updatedTeacher;
};

const changePassword = async (user, payload) => {
  const foundUser = await teacherRepository.findUserById(user.userId);
  if (!foundUser) throw new AppError("User not found", 404);
  const ok = await foundUser.comparePassword(payload.currentPassword || "");
  if (!ok) throw new AppError("Current password is incorrect", 400);
  foundUser.password = payload.newPassword;
  await foundUser.save();
  return { changed: true };
};

const salaryAndPayslip = async (user) => {
  const { teacher } = await getTeacherContext(user);
  const salary = Number(teacher.salary || 0);
  const bonus = 0;
  const deductions = 0;
  const netSalary = salary + bonus - deductions;
  return {
    salary,
    bonus,
    deductions,
    netSalary,
    paymentStatus: "PENDING",
    payslipUrl: "",
  };
};

const activityLogs = async (user) => {
  const { schoolId, teacher } = await getTeacherContext(user);
  return teacherRepository.listActivityLogs({ schoolId, teacherId: teacher._id });
};

export const teacherService = {
  getDashboard,
  listAssignedStudents,
  getStudentProfile,
  markAttendance,
  bulkMarkAttendance,
  getDailyAttendanceRoster,
  saveDailyAttendanceBatch,
  attendanceReports,
  getMonthlyAttendanceGrid,
  createHomework,
  getHomeworkScope,
  updateHomework,
  deleteHomework,
  listHomework,
  createExam,
  listExams,
  upsertMarks,
  getStudentResults,
  getTimetable,
  getTodayTimetable,
  sendCommunication,
  communicationHistory,
  listTeacherNotices,
  listAnnouncements,
  createStudyMaterial,
  createStudyMaterialMultipart,
  listStudyMaterial,
  listStudyMaterialsTeacher,
  updateStudyMaterial,
  deleteStudyMaterial,
  listAssignedClassesWithSubjects,
  studentPerformanceInsights,
  applyLeave,
  cancelLeave,
  listLeaves,
  listStudentLeavesForClassTeacher,
  getStudentLeaveStatsForClassTeacher,
  decideStudentLeave,
  createDiary,
  listDiary,
  scheduleOnlineClass,
  listOnlineClasses,
  listDoubts,
  answerDoubt,
  listNotifications,
  markNotificationRead,
  updateProfile,
  changePassword,
  salaryAndPayslip,
  activityLogs,
};

import mongoose from "mongoose";
import AppError from "../../common/errors/AppError.js";
import Notification from "../../models/Notification.js";
import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";
import ClassModel from "../../models/Class.js";
import Subject from "../../models/Subject.js";
import OnlineExam from "../../models/OnlineExam.js";
import OnlineQuestion from "../../models/OnlineQuestion.js";
import OnlineExamAttempt from "../../models/OnlineExamAttempt.js";
import OnlineExamResult from "../../models/OnlineExamResult.js";

const ensureObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(String(value || ""))) throw new AppError(`Invalid ${fieldName}`, 400);
  return new mongoose.Types.ObjectId(String(value));
};

const parsePaging = (query = {}) => {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 12)));
  return { page, limit, skip: (page - 1) * limit };
};

const bool = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "on"].includes(String(value).trim().toLowerCase());
};

const text = (value) => String(value || "").trim();
const arr = (value) => (Array.isArray(value) ? value.map((item) => text(item)).filter(Boolean) : []);

const notify = async ({ schoolId, userId, title, message, type }) => {
  if (!userId) return null;
  return Notification.create({ schoolId, userId, title, message, type });
};

const teacherByUser = async (user) => {
  const teacher = await Teacher.findOne({ schoolId: user.schoolId, userId: user.userId }).lean();
  if (!teacher) throw new AppError("Teacher profile not found", 404);
  return teacher;
};

const studentByUser = async (user) => {
  const student = await Student.findOne({ schoolId: user.schoolId, userId: user.userId }).populate("userId", "name email").populate("classId", "name section");
  if (!student) throw new AppError("Student profile not found", 404);
  return student;
};

const computedStatus = (exam) => {
  const now = new Date();
  if (["REJECTED", "LOCKED", "RESULT_PUBLISHED"].includes(exam.status)) return exam.status;
  if (new Date(exam.endDateTime) < now) return "COMPLETED";
  if (new Date(exam.startDateTime) <= now && new Date(exam.endDateTime) >= now) return "LIVE";
  return exam.status;
};

const serializeExam = (exam) => {
  const row = exam.toObject ? exam.toObject() : exam;
  return { ...row, computedStatus: computedStatus(row) };
};

const filterExams = (schoolId, query = {}, teacherId = null) => {
  const filter = { schoolId };
  if (teacherId) filter.teacherId = teacherId;
  if (query.status) filter.status = query.status;
  if (query.classId && mongoose.Types.ObjectId.isValid(String(query.classId))) filter.classId = String(query.classId);
  if (query.subjectId && mongoose.Types.ObjectId.isValid(String(query.subjectId))) filter.subjectId = String(query.subjectId);
  if (query.search) {
    const regex = new RegExp(text(query.search), "i");
    filter.$or = [{ title: regex }, { subjectName: regex }, { className: regex }];
  }
  return filter;
};

const optionPayload = (payload = {}, questionType = "MCQ") => {
  const existing = Array.isArray(payload.options)
    ? payload.options.map((item, index) => ({
        key: text(item.key || String.fromCharCode(65 + index)),
        text: text(item.text),
        isCorrect: bool(item.isCorrect),
      }))
    : [];
  if (existing.length) return existing.filter((item) => item.text);
  if (!["MCQ", "MULTIPLE_SELECT", "TRUE_FALSE"].includes(questionType)) return [];
  return ["A", "B", "C", "D", "E", "F"]
    .map((key) => ({ key, text: text(payload[`option${key}`] || payload[`option${key.toLowerCase()}`]), isCorrect: false }))
    .filter((item) => item.text);
};

const questionPayload = (payload = {}, user, teacherId, sourceType = "MANUAL") => {
  const questionType = text(payload.questionType || "MCQ").toUpperCase();
  const options = optionPayload(payload, questionType);
  const correctAnswers =
    payload.correctAnswers !== undefined
      ? Array.isArray(payload.correctAnswers)
        ? payload.correctAnswers
        : String(payload.correctAnswers).split(/[|,]/)
      : options.filter((item) => item.isCorrect).map((item) => item.key);
  return {
    schoolId: user.schoolId,
    createdByUserId: user.userId,
    teacherId,
    subjectId: payload.subjectId && mongoose.Types.ObjectId.isValid(String(payload.subjectId)) ? payload.subjectId : null,
    subjectName: text(payload.subjectName),
    classId: payload.classId && mongoose.Types.ObjectId.isValid(String(payload.classId)) ? payload.classId : null,
    className: text(payload.className),
    section: text(payload.section),
    topic: text(payload.topic),
    tags: arr(payload.tags || []),
    difficulty: text(payload.difficulty || "MEDIUM").toUpperCase(),
    bloomLevel: text(payload.bloomLevel || "Understand"),
    questionType,
    questionText: text(payload.questionText || payload.question),
    options,
    correctAnswers: correctAnswers.map((item) => text(item)).filter(Boolean),
    explanation: text(payload.explanation),
    marks: Number(payload.marks || 1),
    negativeMarks: Number(payload.negativeMarks || 0),
    reusable: payload.reusable === undefined ? true : bool(payload.reusable, true),
    isActive: payload.isActive === undefined ? true : bool(payload.isActive, true),
    sourceType,
  };
};

const parseCsvLine = (line = "") => {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values.map((item) => item.trim());
};

const parseCsv = (csvText = "") => {
  const lines = String(csvText).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) throw new AppError("CSV must include a header and at least one row", 400);
  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, valueIndex) => [header, values[valueIndex] || ""]));
    if (!text(row.question)) throw new AppError(`Question missing on row ${index + 2}`, 400);
    return row;
  });
};

const getTeacherContext = async (user) => {
  const teacher = await teacherByUser(user);
  const [classes, subjects] = await Promise.all([
    ClassModel.find({ schoolId: user.schoolId, $or: [{ classTeacherId: teacher._id }, { _id: { $in: teacher.assignedClasses || [] } }] }).sort({ name: 1, section: 1 }).lean(),
    Subject.find({ schoolId: user.schoolId, teacherId: teacher._id }).sort({ name: 1 }).lean(),
  ]);
  return { teacher, classes, subjects };
};

const getTeacherDashboard = async (user) => {
  const teacher = await teacherByUser(user);
  const schoolObjectId = ensureObjectId(user.schoolId, "schoolId");
  const teacherObjectId = ensureObjectId(teacher._id, "teacherId");
  const sixMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);
  const [examStats, questionStats, monthlyExamActivity, questionTypeMix] = await Promise.all([
    OnlineExam.aggregate([
      { $match: { schoolId: schoolObjectId, teacherId: teacherObjectId } },
      { $group: { _id: null, totalExams: { $sum: 1 }, liveExams: { $sum: { $cond: [{ $eq: ["$status", "LIVE"] }, 1, 0] } }, pendingApproval: { $sum: { $cond: [{ $eq: ["$status", "PENDING_APPROVAL"] }, 1, 0] } } } },
    ]),
    OnlineQuestion.aggregate([
      { $match: { schoolId: schoolObjectId, teacherId: teacherObjectId } },
      { $group: { _id: null, totalQuestions: { $sum: 1 }, aiGenerated: { $sum: { $cond: [{ $eq: ["$sourceType", "AI"] }, 1, 0] } }, imported: { $sum: { $cond: [{ $eq: ["$sourceType", "IMPORT"] }, 1, 0] } } } },
    ]),
    OnlineExam.aggregate([
      { $match: { schoolId: schoolObjectId, teacherId: teacherObjectId, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    OnlineQuestion.aggregate([
      { $match: { schoolId: schoolObjectId, teacherId: teacherObjectId } },
      { $group: { _id: "$questionType", count: { $sum: 1 } } },
    ]),
  ]);
  return {
    stats: {
      totalExams: examStats[0]?.totalExams || 0,
      liveExams: examStats[0]?.liveExams || 0,
      pendingApproval: examStats[0]?.pendingApproval || 0,
      totalQuestions: questionStats[0]?.totalQuestions || 0,
      aiGeneratedQuestions: questionStats[0]?.aiGenerated || 0,
      importedQuestions: questionStats[0]?.imported || 0,
    },
    charts: {
      monthlyExamActivity: monthlyExamActivity.map((item) => ({ month: `${String(item._id.month).padStart(2, "0")}/${item._id.year}`, count: item.count })),
      questionTypeMix: questionTypeMix.map((item) => ({ type: item._id, count: item.count })),
    },
  };
};

const listTeacherExams = async (user, query = {}) => {
  const teacher = await teacherByUser(user);
  const { page, limit, skip } = parsePaging(query);
  const filter = filterExams(user.schoolId, query, teacher._id);
  const [rows, total] = await Promise.all([
    OnlineExam.find(filter).sort({ startDateTime: -1 }).skip(skip).limit(limit),
    OnlineExam.countDocuments(filter),
  ]);
  return { data: rows.map(serializeExam), pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } };
};

const createTeacherExam = async (user, payload = {}) => {
  const teacher = await teacherByUser(user);
  const classId = ensureObjectId(payload.classId, "classId");
  const classRow = await ClassModel.findOne({ _id: classId, schoolId: user.schoolId }).lean();
  if (!classRow) throw new AppError("Class not found", 404);
  let subjectRow = null;
  if (payload.subjectId) {
    subjectRow = await Subject.findOne({ _id: payload.subjectId, schoolId: user.schoolId }).lean();
    if (!subjectRow) throw new AppError("Subject not found", 404);
  }
  const questionIds = arr(payload.questionIds).filter((id) => mongoose.Types.ObjectId.isValid(id));
  const linkedQuestions = questionIds.length ? await OnlineQuestion.find({ _id: { $in: questionIds }, schoolId: user.schoolId, teacherId: teacher._id }).select("marks") : [];
  const totalMarks = payload.totalMarks !== undefined ? Number(payload.totalMarks) : linkedQuestions.reduce((sum, item) => sum + Number(item.marks || 0), 0);
  const exam = await OnlineExam.create({
    schoolId: user.schoolId,
    createdByUserId: user.userId,
    teacherId: teacher._id,
    title: text(payload.title || payload.examTitle),
    subjectId: subjectRow?._id || null,
    subjectName: subjectRow?.name || text(payload.subjectName),
    classId,
    className: classRow.name,
    section: text(payload.section || classRow.section),
    examType: text(payload.examType || "MCQ").toUpperCase(),
    totalMarks,
    durationMinutes: Number(payload.durationMinutes || payload.duration || 60),
    passingMarks: Number(payload.passingMarks || 0),
    instructions: text(payload.instructions),
    startDateTime: new Date(payload.startDateTime || payload.startDate),
    endDateTime: new Date(payload.endDateTime || payload.endDate),
    status: text(payload.status || "DRAFT").toUpperCase(),
    questionIds,
    randomQuestionCount: Number(payload.randomQuestionCount || 0),
    security: {
      negativeMarkingEnabled: bool(payload.negativeMarkingEnabled),
      negativeMarkPerQuestion: Number(payload.negativeMarkPerQuestion || 0),
      randomQuestionsEnabled: bool(payload.randomQuestionsEnabled, true),
      shuffleOptionsEnabled: bool(payload.shuffleOptionsEnabled, true),
      webcamMonitoringEnabled: bool(payload.webcamMonitoringEnabled),
      autoSubmitEnabled: payload.autoSubmitEnabled === undefined ? true : bool(payload.autoSubmitEnabled, true),
      fullScreenRequired: payload.fullScreenRequired === undefined ? true : bool(payload.fullScreenRequired, true),
      copyPasteBlocked: payload.copyPasteBlocked === undefined ? true : bool(payload.copyPasteBlocked, true),
      rightClickDisabled: payload.rightClickDisabled === undefined ? true : bool(payload.rightClickDisabled, true),
    },
    settings: {
      allowReviewAfterSubmit: payload.allowReviewAfterSubmit === undefined ? true : bool(payload.allowReviewAfterSubmit, true),
      resultVisibleToStudents: payload.resultVisibleToStudents === undefined ? true : bool(payload.resultVisibleToStudents, true),
      allowRetake: bool(payload.allowRetake),
      maxAttempts: Number(payload.maxAttempts || 1),
      rankEnabled: payload.rankEnabled === undefined ? true : bool(payload.rankEnabled, true),
    },
  });
  return serializeExam(exam);
};

const updateTeacherExam = async (user, examId, payload = {}) => {
  const teacher = await teacherByUser(user);
  const exam = await OnlineExam.findOne({ _id: examId, schoolId: user.schoolId, teacherId: teacher._id });
  if (!exam) throw new AppError("Online exam not found", 404);
  ["title", "instructions", "section"].forEach((field) => {
    if (payload[field] !== undefined) exam[field] = text(payload[field]);
  });
  if (payload.status !== undefined) exam.status = text(payload.status).toUpperCase();
  if (payload.totalMarks !== undefined) exam.totalMarks = Number(payload.totalMarks || 0);
  if (payload.durationMinutes !== undefined) exam.durationMinutes = Number(payload.durationMinutes || 60);
  if (payload.passingMarks !== undefined) exam.passingMarks = Number(payload.passingMarks || 0);
  if (payload.startDateTime !== undefined) exam.startDateTime = new Date(payload.startDateTime);
  if (payload.endDateTime !== undefined) exam.endDateTime = new Date(payload.endDateTime);
  await exam.save();
  return serializeExam(exam);
};

const submitExamForApproval = async (user, examId) => {
  const teacher = await teacherByUser(user);
  const exam = await OnlineExam.findOne({ _id: examId, schoolId: user.schoolId, teacherId: teacher._id });
  if (!exam) throw new AppError("Online exam not found", 404);
  if (!exam.questionIds.length) throw new AppError("Add at least one question before requesting approval", 400);
  exam.status = "PENDING_APPROVAL";
  exam.approval = { status: "PENDING", reviewedByUserId: null, reviewedAt: null, reason: "" };
  await exam.save();
  return serializeExam(exam);
};

const publishTeacherExam = async (user, examId) => {
  const teacher = await teacherByUser(user);
  const exam = await OnlineExam.findOne({ _id: examId, schoolId: user.schoolId, teacherId: teacher._id });
  if (!exam) throw new AppError("Online exam not found", 404);
  if (!["APPROVED", "LIVE", "COMPLETED"].includes(computedStatus(exam))) throw new AppError("Exam must be approved before publishing", 400);
  exam.status = new Date(exam.startDateTime) <= new Date() ? "LIVE" : "APPROVED";
  await exam.save();
  const students = await Student.find({ schoolId: user.schoolId, classId: exam.classId, section: exam.section }).populate("userId", "_id");
  await Promise.all(students.map((student) => notify({ schoolId: user.schoolId, userId: student.userId?._id, title: "New online exam scheduled", message: `${exam.title} has been scheduled for your class.`, type: "ONLINE_EXAM_SCHEDULED" })));
  return serializeExam(exam);
};

const listQuestionBank = async (user, query = {}) => {
  const teacher = await teacherByUser(user);
  const { page, limit, skip } = parsePaging(query);
  const filter = { schoolId: user.schoolId, teacherId: teacher._id };
  if (query.search) {
    const regex = new RegExp(text(query.search), "i");
    filter.$or = [{ questionText: regex }, { topic: regex }, { subjectName: regex }];
  }
  if (query.classId && mongoose.Types.ObjectId.isValid(String(query.classId))) filter.classId = String(query.classId);
  if (query.subjectId && mongoose.Types.ObjectId.isValid(String(query.subjectId))) filter.subjectId = String(query.subjectId);
  const [rows, total] = await Promise.all([
    OnlineQuestion.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    OnlineQuestion.countDocuments(filter),
  ]);
  return { data: rows, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } };
};

const createQuestion = async (user, payload = {}, sourceType = "MANUAL") => {
  const teacher = await teacherByUser(user);
  const data = questionPayload(payload, user, teacher._id, sourceType);
  if (!data.questionText) throw new AppError("Question text is required", 400);
  return OnlineQuestion.create(data);
};

const deleteQuestion = async (user, questionId) => {
  const teacher = await teacherByUser(user);
  const linked = await OnlineExam.countDocuments({ schoolId: user.schoolId, teacherId: teacher._id, questionIds: questionId });
  if (linked > 0) throw new AppError("Question is already linked to an exam", 400);
  const deleted = await OnlineQuestion.findOneAndDelete({ _id: questionId, schoolId: user.schoolId, teacherId: teacher._id });
  if (!deleted) throw new AppError("Question not found", 404);
  return { deleted: true };
};

const importQuestions = async (user, payload = {}) => {
  const teacher = await teacherByUser(user);
  const rows = parseCsv(payload.csvText);
  const docs = rows.map((row) =>
    questionPayload(
      {
        questionText: row.question,
        optionA: row["option a"] || row.optiona,
        optionB: row["option b"] || row.optionb,
        optionC: row["option c"] || row.optionc,
        optionD: row["option d"] || row.optiond,
        correctAnswers: row["correct answer"] || row.correctanswer || row.answer,
        marks: row.marks || 1,
        negativeMarks: row["negative marks"] || row.negativemarks || 0,
        difficulty: row.difficulty || "MEDIUM",
        topic: row.topic || "",
      },
      user,
      teacher._id,
      "IMPORT"
    )
  );
  const inserted = await OnlineQuestion.insertMany(docs);
  return { importedCount: inserted.length, preview: inserted.slice(0, 5) };
};

const generateAiQuestions = async (user, payload = {}) => {
  const teacher = await teacherByUser(user);
  const count = Math.min(20, Math.max(1, Number(payload.count || 5)));
  const topic = text(payload.topic || "General Topic");
  const difficulty = text(payload.difficulty || "MEDIUM").toUpperCase();
  const docs = Array.from({ length: count }).map((_, index) =>
    questionPayload(
      {
        questionText: `${topic}: Which statement best answers auto-generated question ${index + 1}?`,
        optionA: `Core concept for ${topic} ${index + 1}`,
        optionB: `Distractor one for ${topic} ${index + 1}`,
        optionC: `Distractor two for ${topic} ${index + 1}`,
        optionD: `Distractor three for ${topic} ${index + 1}`,
        correctAnswers: "A",
        marks: 1,
        difficulty,
        topic,
      },
      user,
      teacher._id,
      "AI"
    )
  );
  const inserted = await OnlineQuestion.insertMany(docs);
  return { generatedCount: inserted.length, questions: inserted };
};

const teacherResults = async (user) => {
  const teacher = await teacherByUser(user);
  const examIds = await OnlineExam.find({ schoolId: user.schoolId, teacherId: teacher._id }).select("_id").lean();
  return OnlineExamResult.find({ schoolId: user.schoolId, examId: { $in: examIds.map((item) => item._id) } })
    .populate("examId", "title subjectName className section teacherId passingMarks settings")
    .populate({ path: "studentId", populate: [{ path: "userId", select: "name email" }, { path: "classId", select: "name section" }] })
    .sort({ createdAt: -1 });
};

const gradeResult = async (user, resultId, payload = {}) => {
  const teacher = await teacherByUser(user);
  const result = await OnlineExamResult.findOne({ _id: resultId, schoolId: user.schoolId }).populate("examId");
  if (!result) throw new AppError("Result not found", 404);
  if (String(result.examId?.teacherId) !== String(teacher._id)) throw new AppError("Forbidden", 403);
  result.obtainedMarks = Number(result.obtainedMarks || 0) + Number(payload.additionalMarks || 0);
  result.percentage = result.totalMarks > 0 ? Number(((result.obtainedMarks / result.totalMarks) * 100).toFixed(2)) : 0;
  result.passed = result.obtainedMarks >= Number(result.examId?.passingMarks || 0);
  result.descriptivePendingCount = Math.max(0, Number(result.descriptivePendingCount || 0) - Number(payload.resolvedCount || 1));
  result.evaluationStatus = result.descriptivePendingCount > 0 ? "PENDING_MANUAL" : "FINALIZED";
  await result.save();
  return result;
};

const teacherAnalytics = async (user) => {
  const teacher = await teacherByUser(user);
  const examIds = await OnlineExam.find({ schoolId: user.schoolId, teacherId: teacher._id }).select("_id title").lean();
  const ids = examIds.map((item) => item._id);
  const [marksDistribution, passFailRatio, topRankings] = await Promise.all([
    OnlineExamResult.aggregate([{ $match: { schoolId: ensureObjectId(user.schoolId, "schoolId"), examId: { $in: ids } } }, { $bucket: { groupBy: "$percentage", boundaries: [0, 35, 50, 65, 80, 101], default: "other", output: { count: { $sum: 1 } } } }]),
    OnlineExamResult.aggregate([{ $match: { schoolId: ensureObjectId(user.schoolId, "schoolId"), examId: { $in: ids } } }, { $group: { _id: "$passed", count: { $sum: 1 } } }]),
    OnlineExamResult.find({ schoolId: user.schoolId, examId: { $in: ids } }).populate("examId", "title").populate({ path: "studentId", populate: { path: "userId", select: "name" } }).sort({ obtainedMarks: -1 }).limit(10).lean(),
  ]);
  return {
    marksDistribution: marksDistribution.map((item) => ({ range: String(item._id), count: item.count })),
    passFailRatio: passFailRatio.map((item) => ({ label: item._id ? "Passed" : "Failed", count: item.count })),
    topRankings: topRankings.map((item) => ({ student: item.studentId?.userId?.name || "Student", exam: item.examId?.title || "Exam", obtainedMarks: item.obtainedMarks, percentage: item.percentage })),
  };
};

const studentExamFilter = (student) => ({
  schoolId: student.schoolId,
  classId: student.classId?._id || student.classId,
  section: student.section,
  status: { $in: ["APPROVED", "LIVE", "COMPLETED", "RESULT_PUBLISHED"] },
});

const sanitizeQuestion = (question, exam) => {
  const options = Array.isArray(question.options) ? [...question.options] : [];
  const shuffled = exam.security?.shuffleOptionsEnabled && options.length > 1 ? options.map((item) => ({ ...item, sortKey: Math.random() })).sort((a, b) => a.sortKey - b.sortKey).map(({ sortKey, ...rest }) => rest) : options;
  return { _id: question._id, topic: question.topic, difficulty: question.difficulty, questionType: question.questionType, questionText: question.questionText, options: shuffled.map((item) => ({ key: item.key, text: item.text })), marks: question.marks };
};

const selectQuestions = async (exam) => {
  const questions = await OnlineQuestion.find({ _id: { $in: exam.questionIds } }).lean();
  if (exam.security?.randomQuestionsEnabled && Number(exam.randomQuestionCount || 0) > 0 && questions.length > Number(exam.randomQuestionCount)) {
    return [...questions].sort(() => Math.random() - 0.5).slice(0, Number(exam.randomQuestionCount));
  }
  return questions;
};

const listStudentExams = async (user) => {
  const student = await studentByUser(user);
  const exams = await OnlineExam.find(studentExamFilter(student)).sort({ startDateTime: 1 }).lean();
  const results = await OnlineExamResult.find({ schoolId: user.schoolId, userId: user.userId }).select("examId percentage obtainedMarks passed evaluationStatus rank").lean();
  const attempts = await OnlineExamAttempt.find({ schoolId: user.schoolId, userId: user.userId }).select("examId status submittedAt").lean();
  const resultMap = new Map(results.map((item) => [String(item.examId), item]));
  const attemptMap = new Map(attempts.map((item) => [String(item.examId), item]));
  const now = new Date();
  return exams.map((exam) => {
    let bucket = "upcoming";
    if (new Date(exam.startDateTime) <= now && new Date(exam.endDateTime) >= now) bucket = "live";
    if (new Date(exam.endDateTime) < now) bucket = "completed";
    return { ...serializeExam(exam), bucket, result: resultMap.get(String(exam._id)), attempt: attemptMap.get(String(exam._id)) };
  });
};

const studentExamDetail = async (user, examId) => {
  const student = await studentByUser(user);
  const exam = await OnlineExam.findOne({ _id: examId, ...studentExamFilter(student) }).lean();
  if (!exam) throw new AppError("Exam not found", 404);
  const questions = await selectQuestions(exam);
  return { exam: serializeExam(exam), questions: questions.map((question) => sanitizeQuestion(question, exam)) };
};

const startExam = async (user, examId) => {
  const student = await studentByUser(user);
  const exam = await OnlineExam.findOne({ _id: examId, ...studentExamFilter(student) });
  if (!exam) throw new AppError("Exam not found", 404);
  const now = new Date();
  if (new Date(exam.startDateTime) > now) throw new AppError("Exam has not started yet", 400);
  if (new Date(exam.endDateTime) < now) throw new AppError("Exam time window has ended", 400);
  const previousSubmitted = await OnlineExamAttempt.countDocuments({ schoolId: user.schoolId, examId, studentId: student._id, status: { $in: ["SUBMITTED", "AUTO_SUBMITTED"] } });
  if (!exam.settings?.allowRetake && previousSubmitted > 0) throw new AppError("You have already attempted this exam", 400);
  const active = await OnlineExamAttempt.findOne({ schoolId: user.schoolId, examId, studentId: student._id, status: "IN_PROGRESS" });
  if (active) {
    const questions = await OnlineQuestion.find({ _id: { $in: active.questionIds } }).lean();
    return { attempt: active, exam: serializeExam(exam), questions: questions.map((question) => sanitizeQuestion(question, exam)) };
  }
  const questions = await selectQuestions(exam);
  const attempt = await OnlineExamAttempt.create({
    schoolId: user.schoolId,
    examId: exam._id,
    studentId: student._id,
    userId: user.userId,
    attemptNumber: previousSubmitted + 1,
    startedAt: now,
    expiresAt: new Date(now.getTime() + Number(exam.durationMinutes || 60) * 60000),
    questionIds: questions.map((item) => item._id),
    answers: questions.map((question) => ({ questionId: question._id, questionType: question.questionType, selectedOptions: [], textAnswer: "", isVisited: false, isMarkedForReview: false, savedAt: null, awardedMarks: 0, negativeMarksApplied: 0, isCorrect: false })),
    activityLogs: [{ type: "START", message: "Exam attempt started" }],
  });
  await notify({ schoolId: user.schoolId, userId: user.userId, title: "Exam started", message: `${exam.title} has started.`, type: "ONLINE_EXAM_STARTED" });
  return { attempt, exam: serializeExam(exam), questions: questions.map((question) => sanitizeQuestion(question, exam)) };
};

const saveAnswer = async (user, attemptId, payload = {}) => {
  const attempt = await OnlineExamAttempt.findOne({ _id: attemptId, schoolId: user.schoolId, userId: user.userId, status: "IN_PROGRESS" });
  if (!attempt) throw new AppError("Active exam attempt not found", 404);
  const answer = attempt.answers.find((item) => String(item.questionId) === String(payload.questionId));
  if (!answer) throw new AppError("Question not part of this attempt", 400);
  answer.selectedOptions = arr(payload.selectedOptions);
  answer.textAnswer = text(payload.textAnswer);
  answer.isVisited = true;
  answer.isMarkedForReview = bool(payload.isMarkedForReview);
  answer.savedAt = new Date();
  attempt.markModified("answers");
  await attempt.save();
  return attempt;
};

const logAttempt = async (user, attemptId, payload = {}) => {
  const attempt = await OnlineExamAttempt.findOne({ _id: attemptId, schoolId: user.schoolId, userId: user.userId, status: "IN_PROGRESS" });
  if (!attempt) throw new AppError("Active exam attempt not found", 404);
  const type = text(payload.type || "INFO").toUpperCase();
  attempt.activityLogs.push({ type, message: text(payload.message || type), metadata: payload.metadata || {}, createdAt: new Date() });
  if (type === "TAB_SWITCH") attempt.tabSwitchCount += 1;
  if (type === "FULL_SCREEN_EXIT") attempt.fullScreenExitCount += 1;
  if (type === "COPY_PASTE_BLOCKED") attempt.copyPasteViolations += 1;
  if (type === "RIGHT_CLICK_BLOCKED") attempt.rightClickViolations += 1;
  if (["TAB_SWITCH", "FULL_SCREEN_EXIT", "COPY_PASTE_BLOCKED", "RIGHT_CLICK_BLOCKED"].includes(type)) attempt.violationCount += 1;
  await attempt.save();
  return { violationCount: attempt.violationCount };
};

const sameSet = (left = [], right = []) => {
  const a = [...new Set(left.map((item) => text(item).toLowerCase()))].sort();
  const b = [...new Set(right.map((item) => text(item).toLowerCase()))].sort();
  return a.length === b.length && a.every((item, index) => item === b[index]);
};

const evaluateAttempt = async (attempt, exam) => {
  const questions = await OnlineQuestion.find({ _id: { $in: attempt.questionIds } }).lean();
  const questionMap = new Map(questions.map((item) => [String(item._id), item]));
  let totalMarks = 0;
  let obtainedMarks = 0;
  let negativeMarks = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let attemptedQuestions = 0;
  let descriptivePendingCount = 0;
  const topicMap = new Map();
  attempt.answers = attempt.answers.map((answer) => {
    const question = questionMap.get(String(answer.questionId));
    if (!question) return answer;
    totalMarks += Number(question.marks || 0);
    const selected = arr(answer.selectedOptions);
    const written = text(answer.textAnswer);
    const hasAnswer = selected.length > 0 || Boolean(written);
    if (hasAnswer) attemptedQuestions += 1;
    let isCorrect = false;
    let awardedMarks = 0;
    let negativeMarksApplied = 0;
    if (["DESCRIPTIVE", "MATCH_FOLLOWING"].includes(question.questionType)) {
      if (hasAnswer) descriptivePendingCount += 1;
    } else if (question.questionType === "MULTIPLE_SELECT") {
      isCorrect = hasAnswer && sameSet(selected, question.correctAnswers || []);
    } else if (question.questionType === "FILL_BLANKS") {
      isCorrect = hasAnswer && (question.correctAnswers || []).some((item) => text(item).toLowerCase() === written.toLowerCase());
    } else {
      isCorrect = hasAnswer && text(selected[0]).toLowerCase() === text((question.correctAnswers || [])[0]).toLowerCase();
    }
    if (!["DESCRIPTIVE", "MATCH_FOLLOWING"].includes(question.questionType)) {
      if (isCorrect) {
        awardedMarks = Number(question.marks || 0);
        obtainedMarks += awardedMarks;
        correctAnswers += 1;
      } else if (hasAnswer) {
        wrongAnswers += 1;
        if (exam.security?.negativeMarkingEnabled) {
          negativeMarksApplied = Number(question.negativeMarks || exam.security?.negativeMarkPerQuestion || 0);
          obtainedMarks -= negativeMarksApplied;
          negativeMarks += negativeMarksApplied;
        }
      }
    }
    const topicKey = question.topic || "General";
    const current = topicMap.get(topicKey) || { topic: topicKey, totalQuestions: 0, correctAnswers: 0, obtainedMarks: 0, totalMarks: 0 };
    current.totalQuestions += 1;
    current.totalMarks += Number(question.marks || 0);
    current.obtainedMarks += awardedMarks;
    if (isCorrect) current.correctAnswers += 1;
    topicMap.set(topicKey, current);
    return { ...answer.toObject(), isVisited: answer.isVisited || hasAnswer, isCorrect, awardedMarks, negativeMarksApplied };
  });
  attempt.markModified("answers");
  const topicBreakdown = [...topicMap.values()];
  const weakTopics = topicBreakdown.filter((item) => item.totalMarks > 0 && item.obtainedMarks / item.totalMarks < 0.5).map((item) => item.topic);
  const finalMarks = Math.max(0, obtainedMarks);
  return {
    totalQuestions: attempt.answers.length,
    attemptedQuestions,
    correctAnswers,
    wrongAnswers,
    descriptivePendingCount,
    totalMarks,
    obtainedMarks: finalMarks,
    negativeMarks,
    percentage: totalMarks > 0 ? Number(((finalMarks / totalMarks) * 100).toFixed(2)) : 0,
    passed: finalMarks >= Number(exam.passingMarks || 0),
    topicBreakdown,
    weakTopics,
    evaluationStatus: descriptivePendingCount > 0 ? "PENDING_MANUAL" : "AUTO_EVALUATED",
  };
};

const rerank = async (schoolId, examId) => {
  const rows = await OnlineExamResult.find({ schoolId, examId }).sort({ obtainedMarks: -1, percentage: -1, createdAt: 1 });
  await Promise.all(rows.map((row, index) => { row.rank = index + 1; return row.save(); }));
};

const submitExam = async (user, attemptId, payload = {}) => {
  const attempt = await OnlineExamAttempt.findOne({ _id: attemptId, schoolId: user.schoolId, userId: user.userId, status: "IN_PROGRESS" });
  if (!attempt) throw new AppError("Active exam attempt not found", 404);
  const exam = await OnlineExam.findOne({ _id: attempt.examId, schoolId: user.schoolId });
  if (!exam) throw new AppError("Exam not found", 404);
  attempt.status = bool(payload.autoSubmitted) ? "AUTO_SUBMITTED" : "SUBMITTED";
  attempt.submittedAt = new Date();
  attempt.activityLogs.push({ type: attempt.status, message: attempt.status === "AUTO_SUBMITTED" ? "Exam auto-submitted on timeout" : "Exam submitted by student", metadata: {}, createdAt: new Date() });
  const evaluated = await evaluateAttempt(attempt, exam);
  await attempt.save();
  const result = await OnlineExamResult.findOneAndUpdate({ schoolId: user.schoolId, attemptId: attempt._id }, { schoolId: user.schoolId, examId: exam._id, attemptId: attempt._id, studentId: attempt.studentId, userId: user.userId, ...evaluated, publishedAt: exam.settings?.resultVisibleToStudents ? new Date() : null }, { new: true, upsert: true, setDefaultsOnInsert: true });
  await rerank(user.schoolId, exam._id);
  await notify({ schoolId: user.schoolId, userId: user.userId, title: "Exam submitted", message: `${exam.title} has been submitted successfully.`, type: "ONLINE_EXAM_SUBMITTED" });
  return result;
};

const studentResults = async (user) => {
  const rows = await OnlineExamResult.find({ schoolId: user.schoolId, userId: user.userId }).populate("examId", "title subjectName className section settings").sort({ createdAt: -1 }).lean();
  return rows.filter((row) => row.examId?.settings?.resultVisibleToStudents !== false || row.publishedAt);
};

export const onlineExamService = {
  getTeacherContext,
  getTeacherDashboard,
  listTeacherExams,
  createTeacherExam,
  updateTeacherExam,
  submitExamForApproval,
  publishTeacherExam,
  listQuestionBank,
  createQuestion,
  deleteQuestion,
  importQuestions,
  generateAiQuestions,
  teacherResults,
  gradeResult,
  teacherAnalytics,
  listStudentExams,
  studentExamDetail,
  startExam,
  saveAnswer,
  logAttempt,
  submitExam,
  studentResults,
};

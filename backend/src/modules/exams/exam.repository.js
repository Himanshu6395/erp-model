import mongoose from "mongoose";
import Exam from "../../models/Exam.js";
import ExamSchedule from "../../models/ExamSchedule.js";
import ExamSubject from "../../models/ExamSubject.js";
import ReportCard from "../../models/ReportCard.js";
import Result from "../../models/Result.js";

export const examRepository = {
  createExam: (doc) => Exam.create(doc),
  findExamByIdSchool: ({ schoolId, examId }) => Exam.findOne({ schoolId, _id: examId }).populate("classId").lean(),
  listExamsSchool: ({ schoolId, classId, status }) => {
    const query = { schoolId };
    if (classId) query.classId = classId;
    if (status) query.status = status;
    return Exam.find(query).populate("classId").sort({ startDate: -1, createdAt: -1 });
  },
  listExamsForClasses: ({ schoolId, classIds }) =>
    Exam.find({ schoolId, classId: { $in: classIds } }).populate("classId").sort({ startDate: -1, createdAt: -1 }),
  updateExamById: ({ schoolId, examId, patch }) =>
    Exam.findOneAndUpdate({ schoolId, _id: examId }, patch, { new: true }).populate("classId"),
  deleteExamById: ({ schoolId, examId }) => Exam.deleteOne({ schoolId, _id: examId }),

  createExamSubject: (doc) => ExamSubject.create(doc),
  listExamSubjects: ({ examId }) => ExamSubject.find({ examId }).populate("subjectId").sort({ subjectName: 1 }),
  findExamSubject: ({ schoolId, examId, subjectId }) => ExamSubject.findOne({ schoolId, examId, subjectId }).lean(),
  findExamSubjectById: ({ schoolId, id }) => ExamSubject.findOne({ schoolId, _id: id }).populate("subjectId").lean(),
  updateExamSubjectById: ({ schoolId, examSubjectId, patch }) =>
    ExamSubject.findOneAndUpdate({ schoolId, _id: examSubjectId }, patch, { new: true }).populate("subjectId"),
  deleteExamSubjectById: ({ schoolId, examSubjectId }) => ExamSubject.deleteOne({ schoolId, _id: examSubjectId }),

  createExamSchedule: (doc) => ExamSchedule.create(doc),
  listExamSchedules: ({ examId }) => ExamSchedule.find({ examId }).populate("subjectId invigilatorId").sort({ examDate: 1, startTime: 1 }),
  findExamScheduleById: ({ schoolId, scheduleId }) => ExamSchedule.findOne({ schoolId, _id: scheduleId }).populate("subjectId invigilatorId").lean(),
  updateExamScheduleById: ({ schoolId, scheduleId, patch }) =>
    ExamSchedule.findOneAndUpdate({ schoolId, _id: scheduleId }, patch, { new: true }).populate("subjectId invigilatorId"),
  deleteExamScheduleById: ({ schoolId, scheduleId }) => ExamSchedule.deleteOne({ schoolId, _id: scheduleId }),
  deleteExamSchedulesByExamId: ({ schoolId, examId }) => ExamSchedule.deleteMany({ schoolId, examId }),

  upsertExamResult: ({ filter, payload }) => Result.findOneAndUpdate(filter, payload, { upsert: true, new: true, setDefaultsOnInsert: true }),
  findResultsExamSubject: ({ schoolId, examId, subjectId }) =>
    Result.find({ schoolId, examId, subjectId }).populate({ path: "studentId", populate: { path: "userId", select: "name" } }),
  listExamResults: ({ schoolId, examId }) =>
    Result.find({ schoolId, examId })
      .populate({ path: "studentId", populate: { path: "userId", select: "name" } })
      .populate("subjectId")
      .sort({ createdAt: -1 }),
  findPublishedResultsStudent: ({ schoolId, studentId }) =>
    Result.find({ schoolId, studentId, resultStatus: "PUBLISHED" })
      .populate({ path: "examId", populate: { path: "classId", select: "name section" } })
      .populate("subjectId")
      .sort({ createdAt: -1 }),
  findAllResultsStudent: ({ schoolId, studentId }) =>
    Result.find({ schoolId, studentId }).populate("examId").populate("subjectId").sort({ createdAt: -1 }),
  findResultOne: ({ schoolId, studentId, examId, examSubjectKey }) =>
    Result.findOne({ schoolId, studentId, examId, examSubjectKey }),
  updateResultById: ({ schoolId, resultId, patch }) => Result.findOneAndUpdate({ schoolId, _id: resultId }, patch, { new: true }),
  deleteResultById: ({ schoolId, resultId }) => Result.deleteOne({ schoolId, _id: resultId }),
  deleteResultsByExamId: ({ schoolId, examId }) => Result.deleteMany({ schoolId, examId }),
  setResultRank: ({ resultId, rank }) => Result.updateOne({ _id: resultId }, { $set: { rank } }),

  upsertReportCard: ({ filter, payload }) =>
    ReportCard.findOneAndUpdate(filter, payload, { upsert: true, new: true, setDefaultsOnInsert: true }),
  listReportCards: ({ schoolId, examId }) =>
    ReportCard.find({ schoolId, examId })
      .populate({ path: "studentId", populate: { path: "userId", select: "name" } })
      .sort({ rank: 1, percentage: -1, createdAt: -1 }),
  findReportCardOne: ({ schoolId, examId, studentId }) =>
    ReportCard.findOne({ schoolId, examId, studentId }).populate({ path: "studentId", populate: { path: "userId", select: "name" } }),
  deleteReportCardById: ({ schoolId, reportCardId }) => ReportCard.deleteOne({ schoolId, _id: reportCardId }),

  avgPublishedPercentage: async ({ schoolId, examId, subjectId }) => {
    if (!subjectId) return [];
    const sid = new mongoose.Types.ObjectId(String(schoolId));
    const eid = new mongoose.Types.ObjectId(String(examId));
    const subId = new mongoose.Types.ObjectId(String(subjectId));
    return Result.aggregate([
      {
        $match: {
          schoolId: sid,
          examId: eid,
          subjectId: subId,
          resultStatus: "PUBLISHED",
        },
      },
      { $group: { _id: null, avg: { $avg: "$percentage" }, count: { $sum: 1 } } },
    ]);
  },
};

import mongoose from "mongoose";
import Exam from "../../models/Exam.js";
import ExamSubject from "../../models/ExamSubject.js";
import Result from "../../models/Result.js";

export const examRepository = {
  createExam: (doc) => Exam.create(doc),
  findExamByIdSchool: ({ schoolId, examId }) => Exam.findOne({ schoolId, _id: examId }).populate("classId").lean(),
  listExamsSchool: ({ schoolId, classId, status }) => {
    const q = { schoolId };
    if (classId) q.classId = classId;
    if (status) q.status = status;
    return Exam.find(q).populate("classId").sort({ startDate: -1, createdAt: -1 });
  },
  listExamsForClasses: ({ schoolId, classIds }) =>
    Exam.find({ schoolId, classId: { $in: classIds } }).populate("classId").sort({ startDate: -1, createdAt: -1 }),
  updateExamById: ({ schoolId, examId, patch }) => Exam.findOneAndUpdate({ schoolId, _id: examId }, patch, { new: true }).populate("classId"),

  createExamSubject: (doc) => ExamSubject.create(doc),
  listExamSubjects: ({ examId }) => ExamSubject.find({ examId }).populate("subjectId").sort({ subjectName: 1 }),
  findExamSubject: ({ schoolId, examId, subjectId }) => ExamSubject.findOne({ schoolId, examId, subjectId }).lean(),
  findExamSubjectById: ({ schoolId, id }) => ExamSubject.findOne({ schoolId, _id: id }).populate("subjectId").lean(),

  upsertExamResult: ({ filter, payload }) => Result.findOneAndUpdate(filter, payload, { upsert: true, new: true, setDefaultsOnInsert: true }),
  findResultsExamSubject: ({ schoolId, examId, subjectId }) =>
    Result.find({ schoolId, examId, subjectId }).populate({ path: "studentId", populate: { path: "userId", select: "name" } }),
  findPublishedResultsStudent: ({ schoolId, studentId }) =>
    Result.find({ schoolId, studentId, resultStatus: "PUBLISHED" })
      .populate({ path: "examId", populate: { path: "classId", select: "name section" } })
      .populate("subjectId")
      .sort({ createdAt: -1 }),
  findAllResultsStudent: ({ schoolId, studentId }) =>
    Result.find({ schoolId, studentId }).populate("examId").populate("subjectId").sort({ createdAt: -1 }),
  findResultOne: ({ schoolId, studentId, examId, examSubjectKey }) =>
    Result.findOne({ schoolId, studentId, examId, examSubjectKey }),

  setResultRank: ({ resultId, rank }) => Result.updateOne({ _id: resultId }, { $set: { rank } }),

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

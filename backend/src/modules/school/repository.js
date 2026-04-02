import School from "../../models/School.js";
import User from "../../models/User.js";
import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";
import ClassModel from "../../models/Class.js";
import Notice from "../../models/Notice.js";

export const schoolRepository = {
  createSchool: (payload) => School.create(payload),
  getSchools: ({ filter, skip, limit }) =>
    School.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  countSchools: (filter) => School.countDocuments(filter),
  getSchoolById: (schoolId) => School.findById(schoolId),
  updateSchoolById: (schoolId, payload) => School.findByIdAndUpdate(schoolId, payload, { new: true }),
  deleteSchoolById: (schoolId) => School.findByIdAndDelete(schoolId),
  deleteUsersBySchoolId: (schoolId) => User.deleteMany({ schoolId }),
  deleteStudentsBySchoolId: (schoolId) => Student.deleteMany({ schoolId }),
  deleteTeachersBySchoolId: (schoolId) => Teacher.deleteMany({ schoolId }),
  deleteClassesBySchoolId: (schoolId) => ClassModel.deleteMany({ schoolId }),
  deleteNoticesBySchoolId: (schoolId) => Notice.deleteMany({ schoolId }),
  createUser: (payload) => User.create(payload),
  createStudent: (payload) => Student.create(payload),
  createTeacher: (payload) => Teacher.create(payload),
  createClass: (payload) => ClassModel.create(payload),
  createNotice: (payload) => Notice.create(payload),
};

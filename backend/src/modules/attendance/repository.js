import Attendance from "../../models/Attendance.js";

export const attendanceRepository = {
  findByStudent: ({ schoolId, studentId }) =>
    Attendance.find({ schoolId, studentId }).sort({ date: -1 }),
};

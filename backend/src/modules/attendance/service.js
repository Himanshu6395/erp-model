import { attendanceRepository } from "./repository.js";

const getStudentAttendance = async ({ schoolId, studentId }) => {
  const items = await attendanceRepository.findByStudent({ schoolId, studentId });
  const totalDays = items.length;
  const presentDays = items.filter((item) => item.status === "PRESENT").length;
  const percentage = totalDays ? Number(((presentDays / totalDays) * 100).toFixed(2)) : 0;

  return {
    attendance: items,
    summary: { totalDays, presentDays, percentage },
  };
};

export const attendanceService = {
  getStudentAttendance,
};

import { resultRepository } from "./repository.js";

const getStudentResult = async ({ schoolId, studentId }) => {
  const subjects = await resultRepository.findByStudent({ schoolId, studentId });
  const totalMarks = subjects.reduce((sum, item) => sum + item.marks, 0);
  const percentage = subjects.length ? Number((totalMarks / subjects.length).toFixed(2)) : 0;
  return { subjects, totalMarks, percentage };
};

export const resultService = {
  getStudentResult,
};

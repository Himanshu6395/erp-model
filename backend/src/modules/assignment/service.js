import { assignmentRepository } from "./repository.js";

const getByClass = async ({ schoolId, classId }) => {
  return assignmentRepository.findByClass({ schoolId, classId });
};

export const assignmentService = {
  getByClass,
};

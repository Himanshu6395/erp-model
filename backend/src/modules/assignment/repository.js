import Assignment from "../../models/Assignment.js";

export const assignmentRepository = {
  findByClass: ({ schoolId, classId }) =>
    Assignment.find({ schoolId, classId }).sort({ dueDate: 1 }),
};

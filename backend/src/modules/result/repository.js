import Result from "../../models/Result.js";

export const resultRepository = {
  findByStudent: ({ schoolId, studentId }) =>
    Result.find({ schoolId, studentId }).sort({ subject: 1 }),
};

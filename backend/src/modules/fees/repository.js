import Fees from "../../models/Fees.js";

export const feesRepository = {
  findByStudent: ({ schoolId, studentId }) => Fees.findOne({ schoolId, studentId }),
};

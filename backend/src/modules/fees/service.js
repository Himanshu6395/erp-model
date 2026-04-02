import { feesRepository } from "./repository.js";

const getStudentFees = async ({ schoolId, studentId }) => {
  const fee = await feesRepository.findByStudent({ schoolId, studentId });
  if (!fee) return { total: 0, paid: 0, pending: 0 };
  return {
    total: fee.total,
    paid: fee.paid,
    pending: Math.max(fee.total - fee.paid, 0),
  };
};

export const feesService = {
  getStudentFees,
};

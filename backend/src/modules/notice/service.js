import { noticeRepository } from "./repository.js";

const getBySchool = async ({ schoolId, limit }) => {
  return noticeRepository.findBySchool({ schoolId, limit });
};

export const noticeService = {
  getBySchool,
};

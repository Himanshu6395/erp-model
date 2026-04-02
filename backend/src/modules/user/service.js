import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import { userRepository } from "./repository.js";
import School from "../../models/School.js";

const createSchoolAdmin = async ({ name, email, password, schoolId }) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) throw new AppError("Email already in use", 409);

  const school = await School.findById(schoolId);
  if (!school) throw new AppError("School not found", 404);

  const user = await userRepository.create({
    name,
    email,
    password,
    role: ROLES.SCHOOL_ADMIN,
    schoolId,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
  };
};

export const userService = {
  createSchoolAdmin,
};

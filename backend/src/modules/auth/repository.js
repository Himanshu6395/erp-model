import { userRepository } from "../user/repository.js";

export const authRepository = {
  findUserByEmail: userRepository.findByEmail,
};

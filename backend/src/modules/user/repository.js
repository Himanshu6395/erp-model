import User from "../../models/User.js";

export const userRepository = {
  create: (payload) => User.create(payload),
  findByEmail: (email) => User.findOne({ email }),
  findById: (id) => User.findById(id),
};

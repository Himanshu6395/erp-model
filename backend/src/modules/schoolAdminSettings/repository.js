import School from "../../models/School.js";
import User from "../../models/User.js";
import LoginActivity from "../../models/LoginActivity.js";

export const schoolSettingsRepository = {
  findSchoolById: (schoolId) => School.findById(schoolId),
  findUserById: (userId) => User.findById(userId).select("-password"),
  getLastLogin: (userId) =>
    LoginActivity.findOne({ userId, status: "SUCCESS" }).sort({ timestamp: -1 }).lean(),
};

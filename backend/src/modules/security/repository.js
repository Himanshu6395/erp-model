import School from "../../models/School.js";
import LoginActivity from "../../models/LoginActivity.js";
import SecurityLog from "../../models/SecurityLog.js";
import User from "../../models/User.js";

export const securityRepository = {
  countActiveSchools: () => School.countDocuments({ isActive: true, "security.isBlocked": { $ne: true } }),
  countBlockedSchools: () => School.countDocuments({ "security.isBlocked": true }),
  countFailedLogins: (from) => LoginActivity.countDocuments({ status: "FAILED", ...(from ? { timestamp: { $gte: from } } : {}) }),

  listLoginActivity: (filter) =>
    LoginActivity.find(filter)
      .populate("userId schoolId")
      .sort({ timestamp: -1 })
      .limit(500),

  listBlockedSchools: () => School.find({ "security.isBlocked": true }).sort({ "security.blockedAt": -1 }),
  getSchoolById: (schoolId) => School.findById(schoolId),
  updateSchoolById: (schoolId, payload) => School.findByIdAndUpdate(schoolId, payload, { new: true }),
  updateUsersBySchool: (schoolId, payload) => User.updateMany({ schoolId }, payload),

  createSecurityLog: (payload) => SecurityLog.create(payload),
};

import AppError from "../../common/errors/AppError.js";
import { securityRepository } from "./repository.js";

const securityDashboard = async () => {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [activeSchools, blockedSchools, failedLoginAttempts] = await Promise.all([
    securityRepository.countActiveSchools(),
    securityRepository.countBlockedSchools(),
    securityRepository.countFailedLogins(since24h),
  ]);
  return { activeSchools, blockedSchools, failedLoginAttempts };
};

const listLoginActivity = async (query) => {
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.from || query.to) {
    filter.timestamp = {};
    if (query.from) filter.timestamp.$gte = new Date(query.from);
    if (query.to) filter.timestamp.$lte = new Date(query.to);
  }
  return securityRepository.listLoginActivity(filter);
};

const blockSchool = async (actor, schoolId, reason) => {
  const school = await securityRepository.getSchoolById(schoolId);
  if (!school) throw new AppError("School not found", 404);
  const updated = await securityRepository.updateSchoolById(schoolId, {
    "security.isBlocked": true,
    "security.blockedReason": reason || "Manual block by Super Admin",
    "security.blockedAt": new Date(),
    "security.loginAccess": false,
  });
  await securityRepository.createSecurityLog({
    schoolId,
    userId: actor.userId,
    role: actor.role,
    ipAddress: actor.ipAddress || "",
    action: "SCHOOL_BLOCKED",
    meta: { reason },
  });
  return updated;
};

const unblockSchool = async (actor, schoolId) => {
  const school = await securityRepository.getSchoolById(schoolId);
  if (!school) throw new AppError("School not found", 404);
  const updated = await securityRepository.updateSchoolById(schoolId, {
    "security.isBlocked": false,
    "security.blockedReason": "",
    "security.blockedAt": null,
    "security.failedLoginAttempts": 0,
    "security.loginAccess": true,
  });
  await securityRepository.createSecurityLog({
    schoolId,
    userId: actor.userId,
    role: actor.role,
    ipAddress: actor.ipAddress || "",
    action: "SCHOOL_UNBLOCKED",
  });
  return updated;
};

const setLoginAccess = async (actor, schoolId, loginAccess) => {
  const school = await securityRepository.getSchoolById(schoolId);
  if (!school) throw new AppError("School not found", 404);
  const updated = await securityRepository.updateSchoolById(schoolId, { "security.loginAccess": Boolean(loginAccess) });
  await securityRepository.createSecurityLog({
    schoolId,
    userId: actor.userId,
    role: actor.role,
    ipAddress: actor.ipAddress || "",
    action: loginAccess ? "LOGIN_ENABLED" : "LOGIN_DISABLED",
  });
  return updated;
};

const forceLogoutUsers = async (actor, schoolId) => {
  const school = await securityRepository.getSchoolById(schoolId);
  if (!school) throw new AppError("School not found", 404);
  const now = new Date();
  await securityRepository.updateSchoolById(schoolId, { "security.forceLogoutAt": now });
  await securityRepository.createSecurityLog({
    schoolId,
    userId: actor.userId,
    role: actor.role,
    ipAddress: actor.ipAddress || "",
    action: "FORCE_LOGOUT",
    meta: { forcedAt: now },
  });
  return { forcedAt: now };
};

const blockedSchools = async () => securityRepository.listBlockedSchools();

export const securityService = {
  securityDashboard,
  listLoginActivity,
  blockSchool,
  unblockSchool,
  setLoginAccess,
  forceLogoutUsers,
  blockedSchools,
};

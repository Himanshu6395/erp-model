import { securityService } from "./service.js";

const securityDashboard = async (req, res) =>
  res.json({ success: true, data: await securityService.securityDashboard() });

const loginActivity = async (req, res) =>
  res.json({ success: true, data: await securityService.listLoginActivity(req.query) });

const blockedSchools = async (req, res) =>
  res.json({ success: true, data: await securityService.blockedSchools() });

const blockSchool = async (req, res) =>
  res.json({
    success: true,
    data: await securityService.blockSchool(
      { ...req.user, ipAddress: req.ip },
      req.params.schoolId,
      req.body.reason
    ),
  });

const unblockSchool = async (req, res) =>
  res.json({
    success: true,
    data: await securityService.unblockSchool({ ...req.user, ipAddress: req.ip }, req.params.schoolId),
  });

const setLoginAccess = async (req, res) =>
  res.json({
    success: true,
    data: await securityService.setLoginAccess(
      { ...req.user, ipAddress: req.ip },
      req.params.schoolId,
      req.body.loginAccess
    ),
  });

const forceLogoutUsers = async (req, res) =>
  res.json({
    success: true,
    data: await securityService.forceLogoutUsers({ ...req.user, ipAddress: req.ip }, req.params.schoolId),
  });

export const securityController = {
  securityDashboard,
  loginActivity,
  blockedSchools,
  blockSchool,
  unblockSchool,
  setLoginAccess,
  forceLogoutUsers,
};

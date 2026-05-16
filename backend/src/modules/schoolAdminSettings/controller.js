import { schoolAdminSettingsService } from "./service.js";

const getSettings = async (req, res) => {
  const data = await schoolAdminSettingsService.getAll(req.user);
  return res.json({ success: true, data });
};

const updateProfile = async (req, res) => {
  const data = await schoolAdminSettingsService.updateProfile(req.user, req.body);
  return res.json({ success: true, data });
};

const updateSecurity = async (req, res) => {
  const data = await schoolAdminSettingsService.changePassword(req.user, req.body);
  return res.json({ success: true, data });
};

const logoutAll = async (req, res) => {
  const data = await schoolAdminSettingsService.logoutAllDevices();
  return res.json({ success: true, data });
};

const updateSchoolSettings = async (req, res) => {
  const data = await schoolAdminSettingsService.updateSchoolSettings(req.user, req.body);
  return res.json({ success: true, data });
};

const updateSmtp = async (req, res) => {
  const data = await schoolAdminSettingsService.updateSmtp(req.user, req.body);
  return res.json({ success: true, data });
};

const testSmtp = async (req, res) => {
  const data = await schoolAdminSettingsService.sendTestEmail();
  return res.json({ success: true, data });
};

const updateNotifications = async (req, res) => {
  const data = await schoolAdminSettingsService.updateNotifications(req.user, req.body);
  return res.json({ success: true, data });
};

const updateTheme = async (req, res) => {
  const data = await schoolAdminSettingsService.updateTheme(req.user, req.body);
  return res.json({ success: true, data });
};

export const schoolAdminSettingsController = {
  getSettings,
  updateProfile,
  updateSecurity,
  logoutAll,
  updateSchoolSettings,
  updateSmtp,
  testSmtp,
  updateNotifications,
  updateTheme,
};

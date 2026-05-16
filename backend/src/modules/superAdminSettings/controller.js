import { settingsService } from "./service.js";

const getSettings = async (req, res) => {
  const data = await settingsService.getAll(req.user.userId);
  return res.json({ success: true, data });
};

const updateProfile = async (req, res) => {
  const data = await settingsService.updateProfile(req.user.userId, req.body);
  return res.json({ success: true, data });
};

const changePassword = async (req, res) => {
  const data = await settingsService.changePassword(req.user.userId, req.body);
  return res.json({ success: true, data });
};

const logoutAllDevices = async (req, res) => {
  const data = await settingsService.logoutAllDevices();
  return res.json({ success: true, data });
};

const updatePlatform = async (req, res) => {
  const data = await settingsService.updatePlatform(req.body);
  return res.json({ success: true, data });
};

const updateSmtp = async (req, res) => {
  const data = await settingsService.updateSmtp(req.body);
  return res.json({ success: true, data });
};

const sendTestEmail = async (req, res) => {
  const data = await settingsService.sendTestEmail();
  return res.json({ success: true, data });
};

const updateNotifications = async (req, res) => {
  const data = await settingsService.updateNotifications(req.body);
  return res.json({ success: true, data });
};

const updateBilling = async (req, res) => {
  const data = await settingsService.updateBilling(req.body);
  return res.json({ success: true, data });
};

const updatePermissions = async (req, res) => {
  const data = await settingsService.updatePermissions(req.body);
  return res.json({ success: true, data });
};

const updateTheme = async (req, res) => {
  const data = await settingsService.updateTheme(req.body);
  return res.json({ success: true, data: data.theme });
};

const getPublicTheme = async (req, res) => {
  const data = await settingsService.getPublicTheme();
  return res.json({ success: true, data });
};

const getPublicPlatform = async (req, res) => {
  const data = await settingsService.getPublicPlatform();
  return res.json({ success: true, data });
};

export const settingsController = {
  getSettings,
  updateProfile,
  changePassword,
  logoutAllDevices,
  updatePlatform,
  updateSmtp,
  sendTestEmail,
  updateNotifications,
  updateBilling,
  updatePermissions,
  updateTheme,
  getPublicTheme,
  getPublicPlatform,
};

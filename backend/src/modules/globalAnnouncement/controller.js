import { globalAnnouncementService } from "./service.js";

const getForSchool = async (req, res) => {
  const data = await globalAnnouncementService.getForSchoolPortal();
  return res.json({ success: true, data });
};

const getForSuperAdmin = async (req, res) => {
  const data = await globalAnnouncementService.getForSuperAdmin();
  return res.json({ success: true, data });
};

const putForSuperAdmin = async (req, res) => {
  const data = await globalAnnouncementService.setFromSuperAdmin(req.body, req.user.userId);
  return res.json({ success: true, data });
};

export const globalAnnouncementController = {
  getForSchool,
  getForSuperAdmin,
  putForSuperAdmin,
};

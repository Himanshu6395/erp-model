import { Router } from "express";
import { body } from "express-validator";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import catchAsync from "../../common/utils/catchAsync.js";
import { schoolAdminSettingsController } from "./controller.js";

const router = Router();

router.use(protect, authorize(ROLES.SCHOOL_ADMIN));

router.get("/settings", catchAsync(schoolAdminSettingsController.getSettings));
router.put("/settings/profile", catchAsync(schoolAdminSettingsController.updateProfile));
router.put("/settings/security", catchAsync(schoolAdminSettingsController.updateSecurity));
router.post("/settings/security/logout-all", catchAsync(schoolAdminSettingsController.logoutAll));
router.put("/settings/school-settings", catchAsync(schoolAdminSettingsController.updateSchoolSettings));
router.put("/settings/smtp", catchAsync(schoolAdminSettingsController.updateSmtp));
router.post("/settings/smtp/test", catchAsync(schoolAdminSettingsController.testSmtp));
router.put("/settings/notifications", catchAsync(schoolAdminSettingsController.updateNotifications));
router.put("/settings/theme", catchAsync(schoolAdminSettingsController.updateTheme));

router.put(
  "/settings/change-password",
  [body("currentPassword").isLength({ min: 6 }), body("newPassword").isLength({ min: 8 })],
  validateRequest,
  catchAsync(schoolAdminSettingsController.updateSecurity)
);

export default router;

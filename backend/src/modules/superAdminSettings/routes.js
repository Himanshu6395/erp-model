import { Router } from "express";
import catchAsync from "../../common/utils/catchAsync.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { settingsController } from "./controller.js";

const router = Router();

router.use(protect, authorize(ROLES.SUPER_ADMIN));

router.get("/settings", catchAsync(settingsController.getSettings));
router.put("/settings/profile", catchAsync(settingsController.updateProfile));
router.put("/settings/security/password", catchAsync(settingsController.changePassword));
router.post("/settings/security/logout-all", catchAsync(settingsController.logoutAllDevices));
router.put("/settings/platform", catchAsync(settingsController.updatePlatform));
router.put("/settings/smtp", catchAsync(settingsController.updateSmtp));
router.post("/settings/smtp/test", catchAsync(settingsController.sendTestEmail));
router.put("/settings/notifications", catchAsync(settingsController.updateNotifications));
router.put("/settings/billing", catchAsync(settingsController.updateBilling));
router.put("/settings/permissions", catchAsync(settingsController.updatePermissions));
router.put("/settings/theme", catchAsync(settingsController.updateTheme));

export default router;

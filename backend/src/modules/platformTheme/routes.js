import { Router } from "express";
import catchAsync from "../../common/utils/catchAsync.js";
import { settingsController } from "../superAdminSettings/controller.js";

const router = Router();

router.get("/theme", catchAsync(settingsController.getPublicTheme));
router.get("/settings", catchAsync(settingsController.getPublicPlatform));

export default router;

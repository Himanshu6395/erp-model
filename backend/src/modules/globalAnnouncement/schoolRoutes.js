import { Router } from "express";
import catchAsync from "../../common/utils/catchAsync.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { globalAnnouncementController } from "./controller.js";

const router = Router();

router.get(
  "/global",
  protect,
  authorize(ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  catchAsync(globalAnnouncementController.getForSchool)
);

export default router;

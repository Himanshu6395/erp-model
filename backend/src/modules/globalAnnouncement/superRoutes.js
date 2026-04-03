import { Router } from "express";
import { body } from "express-validator";
import catchAsync from "../../common/utils/catchAsync.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { globalAnnouncementController } from "./controller.js";

const router = Router();

router.use(protect, authorize(ROLES.SUPER_ADMIN));

router.get("/global-announcement", catchAsync(globalAnnouncementController.getForSuperAdmin));

router.put(
  "/global-announcement",
  [
    body("message").optional().isString().isLength({ max: 2000 }),
    body("isActive").isBoolean(),
    body("durationHours")
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || value === "") return true;
        const n = Number(value);
        return Number.isInteger(n) && n >= 1 && n <= 720;
      }),
  ],
  validateRequest,
  catchAsync(globalAnnouncementController.putForSuperAdmin)
);

export default router;

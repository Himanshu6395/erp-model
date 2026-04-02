import { Router } from "express";
import { body, param, query } from "express-validator";
import catchAsync from "../../common/utils/catchAsync.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { securityController } from "./controller.js";

const router = Router();
router.use(protect, authorize(ROLES.SUPER_ADMIN));

router.get("/dashboard", catchAsync(securityController.securityDashboard));
router.get(
  "/login-activity",
  [
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
    query("status").optional().isIn(["SUCCESS", "FAILED"]),
  ],
  validateRequest,
  catchAsync(securityController.loginActivity)
);
router.get("/blocked-schools", catchAsync(securityController.blockedSchools));

router.put(
  "/schools/:schoolId/block",
  [param("schoolId").isMongoId(), body("reason").optional().isString()],
  validateRequest,
  catchAsync(securityController.blockSchool)
);
router.put(
  "/schools/:schoolId/unblock",
  [param("schoolId").isMongoId()],
  validateRequest,
  catchAsync(securityController.unblockSchool)
);
router.put(
  "/schools/:schoolId/login-access",
  [param("schoolId").isMongoId(), body("loginAccess").isBoolean()],
  validateRequest,
  catchAsync(securityController.setLoginAccess)
);
router.post(
  "/schools/:schoolId/force-logout",
  [param("schoolId").isMongoId()],
  validateRequest,
  catchAsync(securityController.forceLogoutUsers)
);

export default router;

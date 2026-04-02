import { Router } from "express";
import { body } from "express-validator";
import catchAsync from "../../common/utils/catchAsync.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { userController } from "./controller.js";

const router = Router();

router.post(
  "/school-admins",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("schoolId").isMongoId(),
  ],
  validateRequest,
  catchAsync(userController.createSchoolAdmin)
);

export default router;

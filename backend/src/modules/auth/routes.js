import { Router } from "express";
import { body } from "express-validator";
import catchAsync from "../../common/utils/catchAsync.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import { authController } from "./controller.js";

const router = Router();

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  validateRequest,
  catchAsync(authController.login)
);

export default router;

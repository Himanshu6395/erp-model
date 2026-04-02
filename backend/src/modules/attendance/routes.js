import { Router } from "express";
import { attendanceController } from "./controller.js";

const router = Router();
router.get("/", attendanceController.placeholder);

export default router;

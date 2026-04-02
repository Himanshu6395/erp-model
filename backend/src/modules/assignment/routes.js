import { Router } from "express";
import { assignmentController } from "./controller.js";

const router = Router();
router.get("/", assignmentController.placeholder);

export default router;

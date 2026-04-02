import { Router } from "express";
import { noticeController } from "./controller.js";

const router = Router();
router.get("/", noticeController.placeholder);

export default router;

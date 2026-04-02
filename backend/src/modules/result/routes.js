import { Router } from "express";
import { resultController } from "./controller.js";

const router = Router();
router.get("/", resultController.placeholder);

export default router;

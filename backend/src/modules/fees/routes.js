import { Router } from "express";
import { feesController } from "./controller.js";

const router = Router();
router.get("/", feesController.placeholder);

export default router;

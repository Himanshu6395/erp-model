import { Router } from "express";
import authRoutes from "../modules/auth/routes.js";
import schoolRoutes from "../modules/school/routes.js";
import studentRoutes from "../modules/student/routes.js";
import adminRoutes from "../modules/admin/routes.js";
import teacherRoutes from "../modules/teacher/routes.js";
import subscriptionRoutes from "../modules/subscription/routes.js";
import securityRoutes from "../modules/security/routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/super-admin", schoolRoutes);
router.use("/super-admin", subscriptionRoutes);
router.use("/super-admin/security", securityRoutes);
router.use("/school-admin", adminRoutes);
router.use("/student", studentRoutes);
router.use("/teacher", teacherRoutes);

export default router;

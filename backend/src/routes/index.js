import { Router } from "express";
import authRoutes from "../modules/auth/routes.js";
import schoolRoutes from "../modules/school/routes.js";
import studentRoutes from "../modules/student/routes.js";
import adminRoutes from "../modules/admin/routes.js";
import teacherRoutes from "../modules/teacher/routes.js";
import subscriptionRoutes from "../modules/subscription/routes.js";
import securityRoutes from "../modules/security/routes.js";
import globalAnnouncementSuperRoutes from "../modules/globalAnnouncement/superRoutes.js";
import globalAnnouncementSchoolRoutes from "../modules/globalAnnouncement/schoolRoutes.js";
import transportRoutes from "../modules/transport/routes.js";
import superAdminSettingsRoutes from "../modules/superAdminSettings/routes.js";
import schoolAdminSettingsRoutes from "../modules/schoolAdminSettings/routes.js";
import platformThemeRoutes from "../modules/platformTheme/routes.js";
import { libraryAdminRoutes, libraryStudentRoutes } from "../modules/library/routes.js";
import { onlineExamAdminRoutes, onlineExamStudentRoutes, onlineExamTeacherRoutes } from "../modules/onlineExam/routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/super-admin", schoolRoutes);
router.use("/super-admin", subscriptionRoutes);
router.use("/super-admin", globalAnnouncementSuperRoutes);
router.use("/super-admin/security", securityRoutes);
router.use("/super-admin", superAdminSettingsRoutes);
router.use("/platform", platformThemeRoutes);
router.use("/announcements", globalAnnouncementSchoolRoutes);
router.use("/school-admin", schoolAdminSettingsRoutes);
router.use("/school-admin/library", libraryAdminRoutes);
router.use("/school-admin/online-exams", onlineExamAdminRoutes);
router.use("/school-admin", adminRoutes);
router.use("/school-admin/transport", transportRoutes);
router.use("/student/online-exams", onlineExamStudentRoutes);
router.use("/student", libraryStudentRoutes);
router.use("/student", studentRoutes);
router.use("/teacher/online-exams", onlineExamTeacherRoutes);
router.use("/teacher", teacherRoutes);

export default router;

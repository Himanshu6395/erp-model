import { Router } from "express";
import { body, param, query } from "express-validator";
import catchAsync from "../../common/utils/catchAsync.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { schoolController } from "./controller.js";

const router = Router();
const schoolCreateValidation = [
  body("schoolName").trim().notEmpty(),
  body("schoolCode").trim().notEmpty(),
  body("email").isEmail(),
  body("phoneNumber").trim().notEmpty(),
  body("establishedYear").isInt({ min: 1800 }),
  body("schoolType").trim().notEmpty(),
  body("affiliationBoard").trim().notEmpty(),
  body("medium").trim().notEmpty(),
  body("addressLine1").trim().notEmpty(),
  body("city").trim().notEmpty(),
  body("state").trim().notEmpty(),
  body("country").trim().notEmpty(),
  body("pincode").trim().notEmpty(),
  body("latitude").isFloat(),
  body("longitude").isFloat(),
  body("classesOffered").isArray({ min: 1 }),
  body("sectionsPerClass").isInt({ min: 1 }),
  body("totalCapacity").isInt({ min: 1 }),
  body("sessionStartMonth").trim().notEmpty(),
  body("sessionEndMonth").trim().notEmpty(),
  body("adminName").trim().notEmpty(),
  body("adminEmail").isEmail(),
  body("adminPhone").trim().notEmpty(),
  body("adminPassword").isLength({ min: 6 }),
  body("maxTeachersAllowed").isInt({ min: 1 }),
  body("maxStaffAllowed").isInt({ min: 1 }),
  body("departments").isArray({ min: 1 }),
  body("maxStudentsAllowed").isInt({ min: 1 }),
  body("admissionPrefix").trim().notEmpty(),
  body("rollNumberFormat").trim().notEmpty(),
  body("planType").trim().notEmpty(),
  body("planPrice").isFloat({ min: 0 }),
  body("billingCycle").trim().notEmpty(),
  body("startDate").isISO8601(),
  body("endDate").isISO8601(),
  body("trialDays").isInt({ min: 0 }),
  body("currency").trim().notEmpty(),
  body("primaryColor").trim().notEmpty(),
  body("secondaryColor").trim().notEmpty(),
  body("timezone").trim().notEmpty(),
  body("language").trim().notEmpty(),
  body("dateFormat").trim().notEmpty(),
  body("timeFormat").trim().notEmpty(),
];

router.post(
  "/schools",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  schoolCreateValidation,
  validateRequest,
  catchAsync(schoolController.createSchool)
);
router.post(
  "/school",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  schoolCreateValidation,
  validateRequest,
  catchAsync(schoolController.createSchool)
);

router.get(
  "/schools",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
    query("search").optional().isString(),
    query("schoolType").optional().isString(),
    query("board").optional().isString(),
    query("status")
      .optional()
      .custom((value) => value === "" || value === undefined || value === "active" || value === "inactive"),
  ],
  validateRequest,
  catchAsync(schoolController.getAllSchools)
);
router.get(
  "/schools/:schoolId",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  [param("schoolId").isMongoId()],
  validateRequest,
  catchAsync(schoolController.getSchoolById)
);
router.put(
  "/schools/:schoolId",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  [param("schoolId").isMongoId()],
  validateRequest,
  catchAsync(schoolController.updateSchoolById)
);
router.delete(
  "/schools/:schoolId",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  [param("schoolId").isMongoId()],
  validateRequest,
  catchAsync(schoolController.deleteSchoolById)
);

router.post(
  "/school-admins",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("phone").optional().isString(),
    body("schoolId").isMongoId(),
  ],
  validateRequest,
  catchAsync(schoolController.createSchoolAdmin)
);
router.post(
  "/school-admin",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("phone").optional().isString(),
    body("schoolId").isMongoId(),
  ],
  validateRequest,
  catchAsync(schoolController.createSchoolAdmin)
);

router.post(
  "/students",
  protect,
  authorize(ROLES.SCHOOL_ADMIN),
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("classId").isMongoId(),
    body("section").trim().notEmpty(),
    body("rollNumber").trim().notEmpty(),
  ],
  validateRequest,
  catchAsync(schoolController.createStudent)
);
router.post(
  "/student",
  protect,
  authorize(ROLES.SCHOOL_ADMIN),
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("classId").isMongoId(),
    body("section").trim().notEmpty(),
    body("rollNumber").trim().notEmpty(),
  ],
  validateRequest,
  catchAsync(schoolController.createStudent)
);

router.post(
  "/teachers",
  protect,
  authorize(ROLES.SCHOOL_ADMIN),
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("subject").optional().isString(),
  ],
  validateRequest,
  catchAsync(schoolController.createTeacher)
);
router.post(
  "/teacher",
  protect,
  authorize(ROLES.SCHOOL_ADMIN),
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("subject").optional().isString(),
  ],
  validateRequest,
  catchAsync(schoolController.createTeacher)
);

router.post(
  "/classes",
  protect,
  authorize(ROLES.SCHOOL_ADMIN),
  [body("name").trim().notEmpty(), body("section").trim().notEmpty()],
  validateRequest,
  catchAsync(schoolController.createClass)
);
router.post(
  "/class",
  protect,
  authorize(ROLES.SCHOOL_ADMIN),
  [body("name").trim().notEmpty(), body("section").trim().notEmpty()],
  validateRequest,
  catchAsync(schoolController.createClass)
);

export default router;

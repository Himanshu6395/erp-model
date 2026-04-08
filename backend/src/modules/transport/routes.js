import { Router } from "express";
import { body, param, query } from "express-validator";
import { authorize, protect } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import catchAsync from "../../common/utils/catchAsync.js";
import { transportController } from "./controller.js";

const router = Router();

router.use(protect, authorize(ROLES.SCHOOL_ADMIN));

const listValidators = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().isString(),
];

const idParam = [param("id").isMongoId()];

const crud = (path, controller, createValidators = [], updateValidators = [], extraListValidators = []) => {
  router.get(path, [...listValidators, ...extraListValidators], validateRequest, catchAsync(controller.list));
  router.post(path, createValidators, validateRequest, catchAsync(controller.create));
  router.get(`${path}/:id`, idParam, validateRequest, catchAsync(controller.getOne));
  router.put(`${path}/:id`, [...idParam, ...updateValidators], validateRequest, catchAsync(controller.update));
  router.delete(`${path}/:id`, idParam, validateRequest, catchAsync(controller.remove));
};

crud(
  "/vehicles",
  transportController.vehicles,
  [
    body("vehicleNumber").trim().notEmpty(),
    body("vehicleType").isIn(["BUS", "VAN", "bus", "van"]),
    body("capacity").isInt({ min: 1 }),
    body("gpsEnabled").optional().isBoolean(),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "MAINTENANCE", "active", "inactive", "maintenance"]),
  ],
  [
    body("vehicleType").optional().isIn(["BUS", "VAN", "bus", "van"]),
    body("capacity").optional().isInt({ min: 1 }),
    body("gpsEnabled").optional().isBoolean(),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "MAINTENANCE", "active", "inactive", "maintenance"]),
  ]
);

crud(
  "/drivers",
  transportController.drivers,
  [
    body("driverName").trim().notEmpty(),
    body("phoneNumber").trim().notEmpty(),
    body("email").optional({ values: "falsy" }).isEmail(),
    body("licenseNumber").trim().notEmpty(),
    body("experienceYears").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("salary").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "active", "inactive"]),
  ],
  [
    body("email").optional({ values: "falsy" }).isEmail(),
    body("experienceYears").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("salary").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "active", "inactive"]),
  ]
);

crud(
  "/conductors",
  transportController.conductors,
  [
    body("name").trim().notEmpty(),
    body("phone").trim().notEmpty(),
    body("assignedVehicleId").optional({ values: "falsy" }).isMongoId(),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "active", "inactive"]),
  ],
  [
    body("assignedVehicleId").optional({ values: "falsy" }).isMongoId(),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "active", "inactive"]),
  ]
);

crud(
  "/routes",
  transportController.routes,
  [
    body("routeName").trim().notEmpty(),
    body("routeCode").trim().notEmpty(),
    body("startLocation").trim().notEmpty(),
    body("endLocation").trim().notEmpty(),
    body("totalDistance").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("estimatedTime").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "active", "inactive"]),
  ],
  [
    body("totalDistance").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("estimatedTime").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "active", "inactive"]),
  ]
);

crud(
  "/stops",
  transportController.stops,
  [
    body("routeId").isMongoId(),
    body("stopName").trim().notEmpty(),
    body("stopOrder").isInt({ min: 1 }),
    body("latitude").optional({ values: "falsy" }).isFloat({ min: -90, max: 90 }),
    body("longitude").optional({ values: "falsy" }).isFloat({ min: -180, max: 180 }),
  ],
  [
    body("routeId").optional().isMongoId(),
    body("stopOrder").optional().isInt({ min: 1 }),
    body("latitude").optional({ values: "falsy" }).isFloat({ min: -90, max: 90 }),
    body("longitude").optional({ values: "falsy" }).isFloat({ min: -180, max: 180 }),
  ],
  [query("routeId").optional().isMongoId()]
);

crud(
  "/assignments",
  transportController.assignments,
  [
    body("routeId").isMongoId(),
    body("vehicleId").isMongoId(),
    body("driverId").isMongoId(),
    body("conductorId").optional({ values: "falsy" }).isMongoId(),
    body("shift").isIn(["MORNING", "AFTERNOON", "morning", "afternoon"]),
    body("startTime").trim().notEmpty(),
    body("endTime").trim().notEmpty(),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "active", "inactive"]),
  ],
  [
    body("routeId").optional().isMongoId(),
    body("vehicleId").optional().isMongoId(),
    body("driverId").optional().isMongoId(),
    body("conductorId").optional({ values: "falsy" }).isMongoId(),
    body("shift").optional().isIn(["MORNING", "AFTERNOON", "morning", "afternoon"]),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "active", "inactive"]),
  ],
  [
    query("routeId").optional().isMongoId(),
    query("vehicleId").optional().isMongoId(),
    query("driverId").optional().isMongoId(),
    query("shift").optional().isString(),
  ]
);

crud(
  "/student-assignments",
  transportController.studentAssignments,
  [
    body("studentId").isMongoId(),
    body("routeId").isMongoId(),
    body("stopId").isMongoId(),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "active", "inactive"]),
  ],
  [
    body("studentId").optional().isMongoId(),
    body("routeId").optional().isMongoId(),
    body("stopId").optional().isMongoId(),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "active", "inactive"]),
  ],
  [query("studentId").optional().isMongoId(), query("routeId").optional().isMongoId()]
);

crud(
  "/fees",
  transportController.fees,
  [
    body("studentId").isMongoId(),
    body("routeId").isMongoId(),
    body("amount").isFloat({ min: 0 }),
    body("paymentFrequency").isIn(["MONTHLY", "QUARTERLY", "YEARLY", "monthly", "quarterly", "yearly"]),
    body("dueDate").isISO8601(),
    body("paymentStatus").optional().isIn(["PAID", "UNPAID", "PARTIAL", "paid", "unpaid", "partial"]),
    body("paymentMode").optional().isIn(["CASH", "ONLINE", "cash", "online"]),
  ],
  [
    body("studentId").optional().isMongoId(),
    body("routeId").optional().isMongoId(),
    body("amount").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("paymentFrequency").optional().isIn(["MONTHLY", "QUARTERLY", "YEARLY", "monthly", "quarterly", "yearly"]),
    body("dueDate").optional({ values: "falsy" }).isISO8601(),
    body("paymentStatus").optional().isIn(["PAID", "UNPAID", "PARTIAL", "paid", "unpaid", "partial"]),
    body("paymentMode").optional().isIn(["CASH", "ONLINE", "cash", "online"]),
  ],
  [query("studentId").optional().isMongoId(), query("routeId").optional().isMongoId()]
);

crud(
  "/attendance",
  transportController.attendance,
  [
    body("studentId").isMongoId(),
    body("date").isISO8601(),
    body("pickupStatus").isIn(["PICKED", "MISSED", "picked", "missed"]),
    body("dropStatus").isIn(["DROPPED", "MISSED", "dropped", "missed"]),
  ],
  [
    body("studentId").optional().isMongoId(),
    body("date").optional({ values: "falsy" }).isISO8601(),
    body("pickupStatus").optional().isIn(["PICKED", "MISSED", "picked", "missed"]),
    body("dropStatus").optional().isIn(["DROPPED", "MISSED", "dropped", "missed"]),
  ],
  [query("studentId").optional().isMongoId(), query("date").optional().isISO8601()]
);

crud(
  "/maintenance",
  transportController.maintenance,
  [
    body("vehicleId").isMongoId(),
    body("serviceType").trim().notEmpty(),
    body("serviceDate").isISO8601(),
    body("cost").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("nextServiceDate").optional({ values: "falsy" }).isISO8601(),
    body("status").optional().isIn(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "scheduled", "in_progress", "completed"]),
  ],
  [
    body("vehicleId").optional().isMongoId(),
    body("serviceDate").optional({ values: "falsy" }).isISO8601(),
    body("cost").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("nextServiceDate").optional({ values: "falsy" }).isISO8601(),
    body("status").optional().isIn(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "scheduled", "in_progress", "completed"]),
  ],
  [query("vehicleId").optional().isMongoId()]
);

crud(
  "/tracking",
  transportController.tracking,
  [
    body("vehicleId").isMongoId(),
    body("latitude").isFloat({ min: -90, max: 90 }),
    body("longitude").isFloat({ min: -180, max: 180 }),
    body("speed").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("timestamp").optional({ values: "falsy" }).isISO8601(),
  ],
  [
    body("vehicleId").optional().isMongoId(),
    body("latitude").optional().isFloat({ min: -90, max: 90 }),
    body("longitude").optional().isFloat({ min: -180, max: 180 }),
    body("speed").optional({ values: "falsy" }).isFloat({ min: 0 }),
    body("timestamp").optional({ values: "falsy" }).isISO8601(),
  ],
  [query("vehicleId").optional().isMongoId()]
);

crud(
  "/notifications",
  transportController.notifications,
  [
    body("title").trim().notEmpty(),
    body("message").trim().notEmpty(),
    body("type").isIn(["DELAY", "EMERGENCY", "GENERAL", "delay", "emergency", "general"]),
    body("sentTo").isIn(["STUDENTS", "PARENTS", "ALL", "students", "parents", "all"]),
    body("date").optional({ values: "falsy" }).isISO8601(),
  ],
  [
    body("title").optional().trim().notEmpty(),
    body("message").optional().trim().notEmpty(),
    body("type").optional().isIn(["DELAY", "EMERGENCY", "GENERAL", "delay", "emergency", "general"]),
    body("sentTo").optional().isIn(["STUDENTS", "PARENTS", "ALL", "students", "parents", "all"]),
    body("date").optional({ values: "falsy" }).isISO8601(),
  ],
  [query("type").optional().isString()]
);

export default router;

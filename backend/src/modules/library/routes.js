import { Router } from "express";
import { body, param, query } from "express-validator";
import catchAsync from "../../common/utils/catchAsync.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { libraryController } from "./controller.js";

const adminRouter = Router();
const studentRouter = Router();

adminRouter.use(protect, authorize(ROLES.SCHOOL_ADMIN));

adminRouter.get("/dashboard", catchAsync(libraryController.getDashboard));
adminRouter.get("/reports", catchAsync(libraryController.getReports));
adminRouter.get("/settings", catchAsync(libraryController.getSettings));
adminRouter.put("/settings", catchAsync(libraryController.updateSettings));

adminRouter.get("/students", [query("search").optional().isString()], validateRequest, catchAsync(libraryController.getStudents));

adminRouter.get("/categories", catchAsync(libraryController.listCategories));
adminRouter.post(
  "/categories",
  [body("name").trim().notEmpty(), body("description").optional().isString(), body("color").optional().isString()],
  validateRequest,
  catchAsync(libraryController.createCategory)
);
adminRouter.put(
  "/categories/:categoryId",
  [param("categoryId").isMongoId(), body("name").optional().trim().notEmpty()],
  validateRequest,
  catchAsync(libraryController.updateCategory)
);
adminRouter.delete("/categories/:categoryId", [param("categoryId").isMongoId()], validateRequest, catchAsync(libraryController.deleteCategory));

adminRouter.get(
  "/books",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().isString(),
    query("status").optional().isString(),
    query("categoryId").optional().isMongoId(),
  ],
  validateRequest,
  catchAsync(libraryController.listBooks)
);
adminRouter.post(
  "/books",
  [
    body("title").trim().notEmpty(),
    body("bookCode").trim().notEmpty(),
    body("categoryId").optional({ values: "falsy" }).isMongoId(),
    body("quantity").optional().isFloat({ min: 0 }),
    body("availableCopies").optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  catchAsync(libraryController.createBook)
);
adminRouter.put(
  "/books/:bookId",
  [param("bookId").isMongoId(), body("categoryId").optional({ values: "falsy" }).isMongoId()],
  validateRequest,
  catchAsync(libraryController.updateBook)
);
adminRouter.delete("/books/:bookId", [param("bookId").isMongoId()], validateRequest, catchAsync(libraryController.deleteBook));

adminRouter.get(
  "/issues",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isString(),
    query("studentId").optional().isMongoId(),
    query("bookId").optional().isMongoId(),
    query("search").optional().isString(),
  ],
  validateRequest,
  catchAsync(libraryController.listIssues)
);
adminRouter.post(
  "/issues",
  [
    body("studentId").isMongoId(),
    body("bookId").isMongoId(),
    body("issueDate").optional().isISO8601(),
    body("dueDate").optional().isISO8601(),
  ],
  validateRequest,
  catchAsync(libraryController.issueBook)
);
adminRouter.post(
  "/issues/:issueId/approve",
  [param("issueId").isMongoId(), body("dueDate").optional().isISO8601()],
  validateRequest,
  catchAsync(libraryController.approveRequest)
);
adminRouter.post(
  "/issues/:issueId/reject",
  [param("issueId").isMongoId(), body("rejectionReason").optional().isString()],
  validateRequest,
  catchAsync(libraryController.rejectRequest)
);
adminRouter.post(
  "/issues/:issueId/return",
  [param("issueId").isMongoId(), body("returnDate").optional().isISO8601(), body("returnNote").optional().isString()],
  validateRequest,
  catchAsync(libraryController.returnBook)
);

adminRouter.get(
  "/fines",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isString(),
    query("studentId").optional().isMongoId(),
  ],
  validateRequest,
  catchAsync(libraryController.listFines)
);
adminRouter.post("/fines/:fineId/pay", [param("fineId").isMongoId()], validateRequest, catchAsync(libraryController.payFine));
adminRouter.post("/fines/:fineId/waive", [param("fineId").isMongoId()], validateRequest, catchAsync(libraryController.waiveFine));

studentRouter.use(protect, authorize(ROLES.STUDENT));
studentRouter.get(
  "/library",
  [query("search").optional().isString(), query("categoryId").optional().isMongoId()],
  validateRequest,
  catchAsync(libraryController.getStudentLibrary)
);
studentRouter.post("/library/requests", [body("bookId").isMongoId(), body("requestNote").optional().isString()], validateRequest, catchAsync(libraryController.requestBook));

export { adminRouter as libraryAdminRoutes, studentRouter as libraryStudentRoutes };

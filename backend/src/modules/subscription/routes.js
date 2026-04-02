import { Router } from "express";
import { body, param } from "express-validator";
import catchAsync from "../../common/utils/catchAsync.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { subscriptionController } from "./controller.js";

const router = Router();
router.use(protect, authorize(ROLES.SUPER_ADMIN));

router.get("/plans", catchAsync(subscriptionController.listPlans));
router.post(
  "/plans",
  [body("name").trim().notEmpty(), body("price").isFloat({ min: 0 }), body("billingCycle").isIn(["MONTHLY", "YEARLY"])],
  validateRequest,
  catchAsync(subscriptionController.createPlan)
);
router.put("/plans/:planId", [param("planId").isMongoId()], validateRequest, catchAsync(subscriptionController.updatePlan));
router.delete("/plans/:planId", [param("planId").isMongoId()], validateRequest, catchAsync(subscriptionController.deletePlan));

router.get("/subscriptions", catchAsync(subscriptionController.listSubscriptions));
router.put(
  "/subscriptions/:subscriptionId/change-plan",
  [param("subscriptionId").isMongoId(), body("planId").isMongoId()],
  validateRequest,
  catchAsync(subscriptionController.changePlan)
);
router.put(
  "/subscriptions/:subscriptionId/extend",
  [param("subscriptionId").isMongoId(), body("days").optional().isInt({ min: 1 })],
  validateRequest,
  catchAsync(subscriptionController.extendSubscription)
);

router.get("/payments", catchAsync(subscriptionController.listPayments));
router.post(
  "/payments",
  [body("subscriptionId").isMongoId(), body("amount").isFloat({ min: 0 }), body("method").isIn(["RAZORPAY", "STRIPE", "CASH"])],
  validateRequest,
  catchAsync(subscriptionController.recordPayment)
);

export default router;

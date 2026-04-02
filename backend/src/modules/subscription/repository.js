import Plan from "../../models/Plan.js";
import Subscription from "../../models/Subscription.js";
import Payment from "../../models/Payment.js";
import School from "../../models/School.js";

export const subscriptionRepository = {
  createPlan: (payload) => Plan.create(payload),
  listPlans: () => Plan.find().sort({ createdAt: -1 }),
  getPlanById: (planId) => Plan.findById(planId),
  updatePlan: (planId, payload) => Plan.findByIdAndUpdate(planId, payload, { new: true }),
  deletePlan: (planId) => Plan.findByIdAndDelete(planId),
  countDefaultPlans: () => Plan.countDocuments({ isDefault: true }),
  unsetDefaultPlans: () => Plan.updateMany({}, { isDefault: false }),

  createSubscription: (payload) => Subscription.create(payload),
  getSubscriptionBySchoolId: (schoolId) => Subscription.findOne({ schoolId }).populate("schoolId planId"),
  getSubscriptionById: (subscriptionId) => Subscription.findById(subscriptionId).populate("schoolId planId"),
  listSubscriptions: () => Subscription.find().populate("schoolId planId").sort({ createdAt: -1 }),
  updateSubscription: (subscriptionId, payload) => Subscription.findByIdAndUpdate(subscriptionId, payload, { new: true }).populate("schoolId planId"),

  createPayment: (payload) => Payment.create(payload),
  listPayments: () => Payment.find().populate("schoolId subscriptionId").sort({ paidAt: -1 }),

  getSchoolById: (schoolId) => School.findById(schoolId),
  listSchools: (filter = {}) => School.find(filter).sort({ createdAt: -1 }),
  updateSchoolById: (schoolId, payload) => School.findByIdAndUpdate(schoolId, payload, { new: true }),
};

import AppError from "../../common/errors/AppError.js";
import { subscriptionRepository } from "./repository.js";

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const addBillingCycle = (date, billingCycle) => {
  const d = new Date(date);
  if (billingCycle === "YEARLY") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
};

const expireSubscriptionsIfNeeded = async () => {
  const rows = await subscriptionRepository.listSubscriptions();
  const now = new Date();
  await Promise.all(
    rows
      .filter((item) => ["ACTIVE", "TRIAL"].includes(item.status) && item.endDate && new Date(item.endDate) < now)
      .map((item) => subscriptionRepository.updateSubscription(item._id, { status: "EXPIRED" }))
  );
};

const listPlans = async () => subscriptionRepository.listPlans();

const createPlan = async (payload) => {
  if (payload.isDefault) await subscriptionRepository.unsetDefaultPlans();
  return subscriptionRepository.createPlan({
    name: payload.name,
    price: Number(payload.price || 0),
    billingCycle: payload.billingCycle || "MONTHLY",
    trialDays: Number(payload.trialDays || 0),
    features: payload.features || {},
    limits: payload.limits || {},
    isDefault: Boolean(payload.isDefault),
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
  });
};

const updatePlan = async (planId, payload) => {
  const plan = await subscriptionRepository.getPlanById(planId);
  if (!plan) throw new AppError("Plan not found", 404);
  if (payload.isDefault) await subscriptionRepository.unsetDefaultPlans();
  return subscriptionRepository.updatePlan(planId, {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.price !== undefined ? { price: Number(payload.price || 0) } : {}),
    ...(payload.billingCycle !== undefined ? { billingCycle: payload.billingCycle } : {}),
    ...(payload.trialDays !== undefined ? { trialDays: Number(payload.trialDays || 0) } : {}),
    ...(payload.features !== undefined ? { features: payload.features } : {}),
    ...(payload.limits !== undefined ? { limits: payload.limits } : {}),
    ...(payload.isDefault !== undefined ? { isDefault: Boolean(payload.isDefault) } : {}),
    ...(payload.isActive !== undefined ? { isActive: Boolean(payload.isActive) } : {}),
  });
};

const deletePlan = async (planId) => {
  const plan = await subscriptionRepository.getPlanById(planId);
  if (!plan) throw new AppError("Plan not found", 404);
  const deleted = await subscriptionRepository.deletePlan(planId);
  return { deleted: Boolean(deleted) };
};

const assignDefaultSubscription = async (schoolId) => {
  let plans = await subscriptionRepository.listPlans();
  let defaultPlan = plans.find((p) => p.isDefault && p.isActive);
  if (!defaultPlan) {
    defaultPlan = plans.find((p) => p.isActive);
  }
  if (!defaultPlan) {
    defaultPlan = await subscriptionRepository.createPlan({
      name: "Free",
      price: 0,
      billingCycle: "MONTHLY",
      trialDays: 14,
      isDefault: true,
      isActive: true,
      features: {
        attendance: true,
        fees: true,
        exam: true,
      },
      limits: {
        maxStudents: 200,
        maxTeachers: 30,
        maxStaff: 30,
      },
    });
  }
  const startDate = new Date();
  const trialDays = Number(defaultPlan.trialDays || 0);
  const endDate = trialDays > 0 ? addDays(startDate, trialDays) : addBillingCycle(startDate, defaultPlan.billingCycle);
  const status = trialDays > 0 ? "TRIAL" : "ACTIVE";
  return subscriptionRepository.createSubscription({
    schoolId,
    planId: defaultPlan._id,
    startDate,
    endDate,
    status,
    trialDays,
  });
};

const listSubscriptions = async () => {
  await expireSubscriptionsIfNeeded();
  return subscriptionRepository.listSubscriptions();
};

const changePlan = async (subscriptionId, planId) => {
  const [sub, plan] = await Promise.all([
    subscriptionRepository.getSubscriptionById(subscriptionId),
    subscriptionRepository.getPlanById(planId),
  ]);
  if (!sub) throw new AppError("Subscription not found", 404);
  if (!plan) throw new AppError("Plan not found", 404);
  const now = new Date();
  const endDate = addBillingCycle(now, plan.billingCycle);
  return subscriptionRepository.updateSubscription(subscriptionId, {
    planId,
    startDate: now,
    endDate,
    status: "ACTIVE",
    trialDays: 0,
    lastRenewedAt: now,
  });
};

const extendSubscription = async (subscriptionId, payload) => {
  const sub = await subscriptionRepository.getSubscriptionById(subscriptionId);
  if (!sub) throw new AppError("Subscription not found", 404);
  const days = Number(payload.days || 0);
  const baseDate = sub.endDate && new Date(sub.endDate) > new Date() ? new Date(sub.endDate) : new Date();
  const nextEnd = days > 0 ? addDays(baseDate, days) : addBillingCycle(baseDate, sub.planId?.billingCycle || "MONTHLY");
  return subscriptionRepository.updateSubscription(subscriptionId, {
    endDate: nextEnd,
    status: "ACTIVE",
    lastRenewedAt: new Date(),
  });
};

const listPayments = async () => subscriptionRepository.listPayments();

const recordPayment = async (payload) => {
  const sub = await subscriptionRepository.getSubscriptionById(payload.subscriptionId);
  if (!sub) throw new AppError("Subscription not found", 404);
  return subscriptionRepository.createPayment({
    schoolId: sub.schoolId?._id || sub.schoolId,
    subscriptionId: sub._id,
    amount: Number(payload.amount || 0),
    method: payload.method || "CASH",
    status: payload.status || "PAID",
    transactionId: payload.transactionId || "",
    paidAt: payload.paidAt ? new Date(payload.paidAt) : new Date(),
    meta: payload.meta || {},
  });
};

export const subscriptionService = {
  listPlans,
  createPlan,
  updatePlan,
  deletePlan,
  assignDefaultSubscription,
  listSubscriptions,
  changePlan,
  extendSubscription,
  listPayments,
  recordPayment,
};
